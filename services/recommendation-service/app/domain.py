from __future__ import annotations

import json
from pathlib import Path
from pydantic import BaseModel, ConfigDict, Field

TIE_ORDER = ["security-and-governance", "reliability-and-operations", "software-delivery", "data-and-decision-making", "developer-experience", "organizational-culture"]


class Score(BaseModel):
    model_config = ConfigDict(extra="forbid")
    dimensionId: str
    normalized: float = Field(ge=0, le=100)


class EvaluationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    assessmentId: str
    ruleSetVersion: str
    maturityLevel: str
    dimensionScores: list[Score] = Field(min_length=6, max_length=6)


class RuleSet:
    def __init__(self, path: str):
        document = json.loads(Path(path).read_text(encoding="utf-8"))
        self.version = document["version"]
        self.rules = {rule["dimensionId"]: rule for rule in document["rules"]}
        if set(self.rules) != set(TIE_ORDER):
            raise ValueError("rule set must define every transformation dimension")

    def evaluate(self, request: EvaluationRequest) -> dict:
        if request.ruleSetVersion != self.version:
            raise ValueError("requested rule-set version is unavailable")
        unique = {score.dimensionId for score in request.dimensionScores}
        if unique != set(TIE_ORDER):
            raise ValueError("scores must contain every dimension exactly once")
        order = {dimension: index for index, dimension in enumerate(TIE_ORDER)}
        selected = sorted(request.dimensionScores, key=lambda score: (score.normalized, order[score.dimensionId]))[:3]
        return {"ruleSetVersion": self.version, "recommendations": [{"ruleId": self.rules[score.dimensionId]["id"], "dimensionId": score.dimensionId, "triggerScore": score.normalized, "priority": index + 1, "rationale": self.rules[score.dimensionId]["rationale"], "action": self.rules[score.dimensionId]["action"]} for index, score in enumerate(selected)]}
