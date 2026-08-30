from app.main import app
from fastapi.testclient import TestClient


def test_paths_and_operation_ids_match_contract_surface():
    document = app.openapi()
    expected = {("/api/v1/recommendations/evaluate", "post"): "evaluateRecommendations", ("/health/live", "get"): "getLiveness", ("/health/ready", "get"): "getReadiness", ("/metrics", "get"): "getMetrics"}
    for (path, method), operation_id in expected.items():
        assert document["paths"][path][method]["operationId"] == operation_id


def test_evaluation_api_is_deterministic_and_correlated():
    dimensions = ["software-delivery", "reliability-and-operations", "security-and-governance", "data-and-decision-making", "developer-experience", "organizational-culture"]
    payload = {"assessmentId": "00000000-0000-0000-0000-000000000001", "ruleSetVersion": "recommendations-1.0.0", "maturityLevel": "Developing", "dimensionScores": [{"dimensionId": dimension, "normalized": 50} for dimension in dimensions]}
    response = TestClient(app).post("/api/v1/recommendations/evaluate", json=payload, headers={"X-Request-ID": "recommendation-test"})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "recommendation-test"
    assert [item["dimensionId"] for item in response.json()["recommendations"]] == ["security-and-governance", "reliability-and-operations", "software-delivery"]
