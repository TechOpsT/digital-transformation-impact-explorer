import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from prometheus_client import Counter
from services.common.http import Problem, install_http_adapters
from .domain import EvaluationRequest, RuleSet

EVALUATIONS = Counter("recommendation_evaluations_total", "Recommendation evaluations", ["status"])

RULE_PATH = os.getenv("RECOMMENDATION_RULES_PATH", "definitions/recommendations-1.0.0.json")
rules: RuleSet | None
try:
    rules = RuleSet(RULE_PATH)
except Exception:
    rules = None

app = FastAPI(title="Recommendation Service API", version="1.0.0")
install_http_adapters(app, "recommendation-service")

@app.post("/api/v1/recommendations/evaluate", summary="Evaluate deterministic recommendation rules", operation_id="evaluateRecommendations")
def evaluate(request: EvaluationRequest) -> dict:
    if rules is None:
        EVALUATIONS.labels("failure").inc()
        raise Problem(503, "rules-unavailable", "Rules unavailable", "The configured recommendation rules could not be loaded.")
    try:
        result = rules.evaluate(request)
        EVALUATIONS.labels("success").inc()
        return result
    except ValueError as exc:
        EVALUATIONS.labels("failure").inc()
        raise Problem(422, "recommendation-input-invalid", "Recommendation input invalid", str(exc)) from exc

@app.get("/health/live", summary="Check process liveness", operation_id="getLiveness")
def live() -> dict: return {"status": "ok"}

@app.get("/health/ready", summary="Check service readiness", operation_id="getReadiness")
def ready() -> dict:
    if rules is None: return JSONResponse(status_code=503, content={"status": "unavailable", "checks": {"rules": "unavailable"}})
    return {"status": "ok", "checks": {"rules": rules.version}}
