from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import select, text

from services.common.http import Problem, install_http_adapters
from .db import Definition, SessionLocal, engine


def get_document(kind: str) -> dict:
    with SessionLocal() as session:
        definition = session.scalar(select(Definition).where(Definition.kind == kind).order_by(Definition.version.desc()))
        if definition is None:
            raise Problem(503, "definition-unavailable", "Definition unavailable", f"No published {kind} definition is available.")
        return definition.document


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    engine.dispose()


app = FastAPI(title="Content Service API", version="1.0.0", lifespan=lifespan)
install_http_adapters(app, "content-service")


@app.get("/api/v1/dimensions", summary="List transformation dimensions", operation_id="listDimensions")
def list_dimensions() -> list[dict]:
    return get_document("content")["dimensions"]


@app.get("/api/v1/dimensions/{dimensionId}", summary="Get a transformation dimension", operation_id="getDimension")
def get_dimension(dimensionId: str) -> dict:
    dimension = next((item for item in get_document("content")["dimensions"] if item["id"] == dimensionId), None)
    if dimension is None:
        raise Problem(404, "dimension-not-found", "Dimension not found", "The requested dimension does not exist.")
    return dimension


@app.get("/api/v1/topics", summary="List transformation topics", operation_id="listTopics")
def list_topics(dimensionId: str | None = None) -> list[dict]:
    topics = get_document("content")["topics"]
    return [item for item in topics if dimensionId is None or item["dimensionId"] == dimensionId]


@app.get("/api/v1/topics/{topicId}", summary="Get a transformation topic", operation_id="getTopic")
def get_topic(topicId: str) -> dict:
    topic = next((item for item in get_document("content")["topics"] if item["id"] == topicId), None)
    if topic is None:
        raise Problem(404, "topic-not-found", "Topic not found", "The requested topic does not exist.")
    return topic


@app.get("/api/v1/questionnaires/current", summary="Get the current questionnaire", operation_id="getCurrentQuestionnaire")
def get_current_questionnaire() -> dict:
    return get_document("questionnaire")


@app.get("/health/live", summary="Check process liveness", operation_id="getLiveness")
def live() -> dict:
    return {"status": "ok"}


@app.get("/health/ready", summary="Check service readiness", operation_id="getReadiness")
def ready() -> dict:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        get_document("content")
        get_document("questionnaire")
        return {"status": "ok", "checks": {"postgres": "ok", "definitions": "ok"}}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "unavailable", "checks": {"postgres": "unavailable", "definitions": "unavailable"}})
