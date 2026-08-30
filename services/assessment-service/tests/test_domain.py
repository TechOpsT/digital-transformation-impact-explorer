import pytest
from app.domain import calculate


def questionnaire():
    dimensions = ["software-delivery", "reliability-and-operations", "security-and-governance", "data-and-decision-making", "developer-experience", "organizational-culture"]
    return {"questions": [{"id": f"q-{index}", "dimensionId": dimension, "options": [{"id": "low", "value": 0}, {"id": "high", "value": 4}]} for index, dimension in enumerate(dimensions)]}


def test_calculates_explainable_scores_and_boundary():
    responses = [{"questionId": f"q-{index}", "optionId": "high" if index >= 3 else "low"} for index in range(6)]
    scores, overall, maturity = calculate(questionnaire(), responses)
    assert [item["normalized"] for item in scores] == [0, 0, 0, 100, 100, 100]
    assert overall == 50.0
    assert maturity == "Developing"


def test_rejects_incomplete_answers():
    with pytest.raises(ValueError, match="every question"):
        calculate(questionnaire(), [])
