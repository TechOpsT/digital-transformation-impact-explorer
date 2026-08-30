from app.main import app
from fastapi.testclient import TestClient


def test_paths_and_operation_ids_match_contract_surface():
    document = app.openapi()
    expected = {("/api/v1/assessments", "post"): "createAssessment", ("/api/v1/assessments/{assessmentId}", "get"): "getAssessment", ("/api/v1/assessments/{assessmentId}/responses", "post"): "submitResponses", ("/api/v1/assessments/{assessmentId}/complete", "post"): "completeAssessment", ("/api/v1/assessments/{assessmentId}/results", "get"): "getResult", ("/health/live", "get"): "getLiveness", ("/health/ready", "get"): "getReadiness", ("/metrics", "get"): "getMetrics"}
    for (path, method), operation_id in expected.items():
        assert document["paths"][path][method]["operationId"] == operation_id


def test_invalid_create_request_uses_problem_details():
    response = TestClient(app).post("/api/v1/assessments", json={"unexpected": True}, headers={"X-Request-ID": "assessment-test"})
    assert response.status_code == 422
    assert response.headers["X-Request-ID"] == "assessment-test"
    assert response.headers["content-type"].startswith("application/problem+json")
    assert response.json()["code"] == "validation-error"
