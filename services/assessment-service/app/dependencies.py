import json
import time
import httpx
import redis
from prometheus_client import Counter, Histogram
from services.common.http import Problem, request_id_context
from .settings import settings

cache = redis.Redis.from_url(settings.redis_url, decode_responses=True, socket_timeout=settings.dependency_timeout_seconds)
DEPENDENCY_CALLS = Counter("dependency_calls_total", "Dependency calls", ["service", "dependency", "status"])
DEPENDENCY_DURATION = Histogram("dependency_call_duration_seconds", "Dependency call duration", ["service", "dependency"])


def headers() -> dict[str, str]:
    return {"X-Request-ID": request_id_context.get()}


def questionnaire() -> dict:
    key = "questionnaire:current"
    try:
        cached = cache.get(key)
        if cached: return json.loads(cached)
    except redis.RedisError:
        pass
    started = time.perf_counter()
    try:
        response = httpx.get(f"{settings.content_url}/api/v1/questionnaires/current", headers=headers(), timeout=settings.dependency_timeout_seconds)
        response.raise_for_status()
        document = response.json()
        DEPENDENCY_CALLS.labels("assessment-service", "content-service", "success").inc()
    except (httpx.HTTPError, ValueError) as exc:
        DEPENDENCY_CALLS.labels("assessment-service", "content-service", "failure").inc()
        raise Problem(503, "content-unavailable", "Content unavailable", "The current questionnaire could not be retrieved.") from exc
    finally:
        DEPENDENCY_DURATION.labels("assessment-service", "content-service").observe(time.perf_counter() - started)
    try:
        cache.setex(key, settings.questionnaire_cache_seconds, json.dumps(document))
    except redis.RedisError:
        pass
    return document


def recommendations(assessment_id: str, maturity: str, scores: list[dict]) -> dict:
    payload = {"assessmentId": assessment_id, "ruleSetVersion": "recommendations-1.0.0", "maturityLevel": maturity, "dimensionScores": [{"dimensionId": item["dimensionId"], "normalized": item["normalized"]} for item in scores]}
    started = time.perf_counter()
    try:
        response = httpx.post(f"{settings.recommendation_url}/api/v1/recommendations/evaluate", json=payload, headers=headers(), timeout=settings.dependency_timeout_seconds)
        response.raise_for_status()
        DEPENDENCY_CALLS.labels("assessment-service", "recommendation-service", "success").inc()
        return response.json()
    except (httpx.HTTPError, ValueError) as exc:
        DEPENDENCY_CALLS.labels("assessment-service", "recommendation-service", "failure").inc()
        raise Problem(503, "recommendation-unavailable", "Recommendations unavailable", "The result could not be completed because recommendations are unavailable.") from exc
    finally:
        DEPENDENCY_DURATION.labels("assessment-service", "recommendation-service").observe(time.perf_counter() - started)
