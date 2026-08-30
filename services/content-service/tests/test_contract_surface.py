from app.main import app
from fastapi.testclient import TestClient


def test_paths_and_operation_ids_match_contract_surface():
    document = app.openapi()
    expected = {("/api/v1/dimensions", "get"): "listDimensions", ("/api/v1/dimensions/{dimensionId}", "get"): "getDimension", ("/api/v1/topics", "get"): "listTopics", ("/api/v1/topics/{topicId}", "get"): "getTopic", ("/api/v1/questionnaires/current", "get"): "getCurrentQuestionnaire", ("/health/live", "get"): "getLiveness", ("/health/ready", "get"): "getReadiness", ("/metrics", "get"): "getMetrics"}
    for (path, method), operation_id in expected.items():
        assert document["paths"][path][method]["operationId"] == operation_id


def test_liveness_and_metrics_are_exposed_with_request_id():
    client = TestClient(app)
    response = client.get("/health/live", headers={"X-Request-ID": "content-test"})
    assert response.json() == {"status": "ok"}
    assert response.headers["X-Request-ID"] == "content-test"
    assert "http_requests_total" in client.get("/metrics").text
