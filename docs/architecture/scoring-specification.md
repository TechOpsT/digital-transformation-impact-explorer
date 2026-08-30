# Scoring specification v1

## Goals

The algorithm is deterministic, transparent, dimension-balanced, and reproducible from a stored result. Version identifier: `scoring-1.0.0`.

## Inputs

- Every question belongs to exactly one dimension.
- Every option has an integer value from 0 through 4.
- All six dimensions must contain at least one answered question.
- Version 1 weights every question equally within its dimension and every dimension equally overall.

## Dimension score

For dimension `d`, with selected values `v` and maximum option value 4:

```text
raw_d        = sum(v)
possible_d   = question_count_d * 4
normalized_d = round_half_up((raw_d / possible_d) * 100, 1)
```

Incomplete or unknown responses are validation errors; they are never silently treated as zero.

## Overall score

Each of the six dimensions has weight `1/6`:

```text
overall = round_half_up(sum(normalized_d * (1/6)), 1)
```

Implementations must use decimal arithmetic for final rounding. The response includes raw, possible, normalized, and weight values for every dimension.

## Maturity levels

| Inclusive score range | Level | Meaning |
| --- | --- | --- |
| 0.0–19.9 | Initial | Practices are mostly reactive or inconsistent |
| 20.0–39.9 | Emerging | Repeatable practices exist in limited areas |
| 40.0–59.9 | Developing | Practices are defined but unevenly adopted |
| 60.0–79.9 | Established | Practices are broadly adopted and measured |
| 80.0–100.0 | Optimizing | Feedback and continuous improvement are systematic |

Boundary classification uses the rounded overall score.

## Recommendation inputs

Rule set `recommendations-1.0.0` receives the six normalized dimension scores and overall maturity level. It ranks dimensions by ascending score, breaking ties by this stable order:

1. security-and-governance
2. reliability-and-operations
3. software-delivery
4. data-and-decision-making
5. developer-experience
6. organizational-culture

Version 1 selects one matching action for each of the three lowest dimensions. A rule response includes the rule ID, triggering dimension and score, rationale, and action. No randomness or generated text is allowed.

## Worked examples

- A dimension with values `[0, 2, 4]` has raw `6`, possible `12`, normalized `50.0`.
- Six dimension scores `[0, 20, 40, 60, 80, 100]` produce overall `50.0` and level `Developing`.
- Overall `79.9` is `Established`; `80.0` is `Optimizing`.

## Invalid inputs

Reject missing required answers, duplicate question responses, unknown IDs, option/question mismatches, values outside 0–4, questionnaire-version mismatches, and attempts to complete an already-invalidated assessment.

