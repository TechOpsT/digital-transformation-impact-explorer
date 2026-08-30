from contextlib import asynccontextmanager
from datetime import UTC, datetime
import uuid

from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
from sqlalchemy import select, text
from prometheus_client import Counter

from services.common.http import Problem, install_http_adapters
from .db import Assessment, SessionLocal, engine
from .dependencies import cache, questionnaire, recommendations
from .domain import calculate
from .schemas import CreateAssessment, SubmitResponses
from .settings import settings

ASSESSMENT_STARTS = Counter("assessment_starts_total", "Assessments started")
ASSESSMENT_COMPLETIONS = Counter("assessment_completions_total", "Assessments completed")
ASSESSMENT_FAILURES = Counter("assessment_failures_total", "Assessment completion failures", ["reason"])


def serialize(item: Assessment) -> dict:
    return {"id": item.id, "questionnaireVersion": item.questionnaire_version, "status": item.status, "responses": item.responses, "createdAt": item.created_at.isoformat(), "updatedAt": item.updated_at.isoformat()}


def find_or_404(session, assessment_id: str) -> Assessment:
    item = session.get(Assessment, assessment_id)
    if item is None: raise Problem(404, "assessment-not-found", "Assessment not found", "The requested assessment does not exist.")
    return item


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    cache.close(); engine.dispose()


app = FastAPI(title="Assessment Service API", version="1.0.0", lifespan=lifespan)
install_http_adapters(app, "assessment-service")


@app.post("/api/v1/assessments", status_code=201, summary="Start an anonymous assessment", operation_id="createAssessment")
def create_assessment(request: CreateAssessment, response: Response) -> dict:
    current = questionnaire()
    if request.questionnaireVersion != current["version"]:
        raise Problem(422, "questionnaire-version-mismatch", "Questionnaire version mismatch", "The requested questionnaire version is not current.")
    item = Assessment(id=str(uuid.uuid4()), questionnaire_version=request.questionnaireVersion, status="started", responses=[])
    with SessionLocal.begin() as session: session.add(item)
    ASSESSMENT_STARTS.inc()
    response.headers["Location"] = f"/api/v1/assessments/{item.id}"
    return serialize(item)


@app.get("/api/v1/assessments/{assessmentId}", summary="Get assessment progress", operation_id="getAssessment")
def get_assessment(assessmentId: str) -> dict:
    with SessionLocal() as session: return serialize(find_or_404(session, assessmentId))


@app.post("/api/v1/assessments/{assessmentId}/responses", summary="Upsert assessment responses", operation_id="submitResponses")
def submit_responses(assessmentId: str, request: SubmitResponses) -> dict:
    current = questionnaire()
    question_by_id = {item["id"]: item for item in current["questions"]}
    incoming = [item.model_dump() for item in request.responses]
    if len({item["questionId"] for item in incoming}) != len(incoming):
        raise Problem(422, "duplicate-question-response", "Duplicate question response", "Each question may appear only once per request.")
    for item in incoming:
        question = question_by_id.get(item["questionId"])
        if question is None or item["optionId"] not in {option["id"] for option in question["options"]}:
            raise Problem(422, "response-invalid", "Response invalid", "A question or response option is not valid for this questionnaire.")
    with SessionLocal.begin() as session:
        assessment = find_or_404(session, assessmentId)
        if assessment.status == "completed": raise Problem(409, "assessment-completed", "Assessment completed", "Completed assessments cannot be changed.")
        if assessment.questionnaire_version != current["version"]: raise Problem(409, "questionnaire-version-mismatch", "Questionnaire version mismatch", "The assessment questionnaire does not match the current definition.")
        merged = {item["questionId"]: item for item in assessment.responses}
        merged.update({item["questionId"]: item for item in incoming})
        assessment.responses = list(merged.values()); assessment.updated_at = datetime.now(UTC)
        session.flush(); result = serialize(assessment)
    return result


@app.post("/api/v1/assessments/{assessmentId}/complete", summary="Complete an assessment idempotently", operation_id="completeAssessment")
def complete_assessment(assessmentId: str) -> dict:
    with SessionLocal.begin() as session:
        assessment = find_or_404(session, assessmentId)
        if assessment.result is not None: return assessment.result
        current = questionnaire()
        if assessment.questionnaire_version != current["version"]: raise Problem(409, "questionnaire-version-mismatch", "Questionnaire version mismatch", "The assessment cannot be completed with a different questionnaire version.")
        try: scores, overall, maturity = calculate(current, assessment.responses)
        except ValueError as exc:
            ASSESSMENT_FAILURES.labels("incomplete").inc()
            raise Problem(422, "assessment-incomplete", "Assessment incomplete", str(exc)) from exc
        try:
            guidance = recommendations(assessment.id, maturity, scores)
        except Problem:
            ASSESSMENT_FAILURES.labels("recommendation_dependency").inc()
            raise
        completed_at = datetime.now(UTC)
        result = {"assessmentId": assessment.id, "questionnaireVersion": assessment.questionnaire_version, "scoringVersion": current["scoringVersion"], "recommendationRuleSetVersion": guidance["ruleSetVersion"], "overallScore": overall, "maturityLevel": maturity, "dimensionScores": scores, "recommendations": guidance["recommendations"], "completedAt": completed_at.isoformat()}
        assessment.status = "completed"; assessment.result = result; assessment.updated_at = completed_at
        ASSESSMENT_COMPLETIONS.inc()
        session.flush()
    return result


@app.get("/api/v1/assessments/{assessmentId}/results", summary="Get an immutable assessment result", operation_id="getResult")
def get_result(assessmentId: str) -> dict:
    with SessionLocal() as session:
        assessment = find_or_404(session, assessmentId)
        if assessment.result is None: raise Problem(404, "result-not-found", "Result not found", "The assessment has not been completed.")
        return assessment.result


@app.get("/health/live", summary="Check process liveness", operation_id="getLiveness")
def live() -> dict: return {"status": "ok"}


@app.get("/health/ready", summary="Check service readiness", operation_id="getReadiness")
def ready() -> dict:
    checks = {}
    try:
        with engine.connect() as connection: connection.execute(text("SELECT 1"))
        checks["postgres"] = "ok"
        cache.ping(); checks["redis"] = "ok"
        questionnaire(); checks["content"] = "ok"
        import httpx
        response = httpx.get(f"{settings.recommendation_url}/health/ready", timeout=settings.dependency_timeout_seconds); response.raise_for_status(); checks["recommendation"] = "ok"
        return {"status": "ok", "checks": checks}
    except Exception:
        checks["dependency"] = "unavailable"
        return JSONResponse(status_code=503, content={"status": "unavailable", "checks": checks})
