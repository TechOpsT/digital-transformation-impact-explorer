from decimal import Decimal, ROUND_HALF_UP

DIMENSIONS = ["software-delivery", "reliability-and-operations", "security-and-governance", "data-and-decision-making", "developer-experience", "organizational-culture"]


def round_half_up(value: Decimal) -> float:
    return float(value.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def calculate(questionnaire: dict, responses: list[dict]) -> tuple[list[dict], float, str]:
    selected = {item["questionId"]: item["optionId"] for item in responses}
    if len(selected) != len(questionnaire["questions"]):
        raise ValueError("every question requires one response")
    values: dict[str, list[int]] = {dimension: [] for dimension in DIMENSIONS}
    for question in questionnaire["questions"]:
        option = next((item for item in question["options"] if item["id"] == selected.get(question["id"])), None)
        if option is None:
            raise ValueError(f"invalid option for question {question['id']}")
        values[question["dimensionId"]].append(option["value"])
    scores = []
    for dimension in DIMENSIONS:
        if not values[dimension]: raise ValueError(f"dimension {dimension} has no questions")
        raw = sum(values[dimension]); possible = len(values[dimension]) * 4
        scores.append({"dimensionId": dimension, "raw": raw, "possible": possible, "normalized": round_half_up(Decimal(raw) / Decimal(possible) * 100), "weight": 1 / 6})
    overall = round_half_up(sum(Decimal(str(item["normalized"])) for item in scores) / Decimal(6))
    maturity = "Initial" if overall < 20 else "Emerging" if overall < 40 else "Developing" if overall < 60 else "Established" if overall < 80 else "Optimizing"
    return scores, overall, maturity
