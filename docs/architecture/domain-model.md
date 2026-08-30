# Initial domain model

## Versioning policy

Questionnaires, scoring policies, maturity ranges, and recommendation rule sets use immutable semantic identifiers such as `questionnaire-1.0.0`. A completed assessment records all applicable versions so its result remains explainable after rules change.

## Entities and ownership

| Entity | Owner | Key fields | Invariants |
| --- | --- | --- | --- |
| Dimension | Content | id, slug, title, description | Stable string ID; one of the six initial dimensions |
| Topic | Content | id, dimensionId, title, body, examples | Belongs to one dimension |
| CaseStudy | Content | id, dimensionIds, summary, outcomes | References one or more dimensions |
| Questionnaire | Content | id, version, status, questions | Published versions are immutable |
| Question | Content | id, dimensionId, prompt, options | At least two options; belongs to one dimension |
| ResponseOption | Content | id, label, numericValue | Integer value in the questionnaire's declared range |
| Assessment | Assessment | id, questionnaireVersion, status, timestamps | Anonymous; state transition is started → completed |
| AssessmentResponse | Assessment | assessmentId, questionId, optionId, value | One current response per question; value is snapshotted |
| DimensionScore | Assessment | dimensionId, raw, possible, normalized | Normalized score is 0–100 |
| AssessmentResult | Assessment | id, versions, scores, maturityLevel | Immutable after completion |
| RecommendationRule | Recommendation | id, ruleSetVersion, conditions, action | Version-controlled, deterministic, and immutable within a published rule set |
| Recommendation | Assessment result | ruleId, dimensionId, triggerScore, priority, rationale, action | Immutable value object traceable to its rule and input score |

## Identifiers and time

- Public identifiers are opaque UUIDs; database sequences are never exposed.
- Domain definition IDs are stable lowercase slugs.
- Timestamps are stored in UTC and serialized as RFC 3339 strings.
- Historical results snapshot response values and all policy versions rather than depending on mutable content.

## Service boundaries

- Content publishes definitions; it does not store user assessment state.
- Assessment validates question and option references against a fixed questionnaire version, calculates and persists scores, and orchestrates recommendation evaluation.
- Recommendation is a stateless evaluator of version-controlled rules from supplied scores; it never queries assessment tables or persists evaluations.
- Assessment snapshots complete recommendation value objects into the immutable completed result.
- The frontend owns no persistent business data and contains no scoring logic.

## Assessment lifecycle

```text
STARTED --submit/replace responses--> STARTED --complete--> COMPLETED
                                                     \\--validation error--> STARTED
COMPLETED --any mutation--> rejected
```

Completion requires one valid response for every required question. Repeated response submission is idempotent for the same assessment and question. Completion is idempotent and returns the existing immutable result after success.
