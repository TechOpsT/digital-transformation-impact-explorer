from pathlib import Path
import os
import pytest
from app.domain import EvaluationRequest, RuleSet

RULES = os.getenv("RECOMMENDATION_RULES_PATH", str(Path("definitions/recommendations-1.0.0.json")))


def request(scores):
    dimensions = ["software-delivery", "reliability-and-operations", "security-and-governance", "data-and-decision-making", "developer-experience", "organizational-culture"]
    return EvaluationRequest(assessmentId="00000000-0000-0000-0000-000000000001", ruleSetVersion="recommendations-1.0.0", maturityLevel="Developing", dimensionScores=[{"dimensionId": dimension, "normalized": score} for dimension, score in zip(dimensions, scores)])


def test_returns_three_lowest_dimensions_in_stable_order():
    result = RuleSet(RULES).evaluate(request([50, 20, 20, 80, 90, 100]))
    assert [item["dimensionId"] for item in result["recommendations"]] == ["security-and-governance", "reliability-and-operations", "software-delivery"]
    assert [item["priority"] for item in result["recommendations"]] == [1, 2, 3]


def test_rejects_unknown_rule_set_version():
    value = request([10, 20, 30, 40, 50, 60])
    value.ruleSetVersion = "recommendations-9.0.0"
    with pytest.raises(ValueError, match="unavailable"):
        RuleSet(RULES).evaluate(value)
