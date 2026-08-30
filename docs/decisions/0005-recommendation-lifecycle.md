# ADR 0005: Recommendation lifecycle and ownership

- Status: Accepted
- Date: 2026-08-30
- Decision owner: Repository owner

## Context

The recommendation service deterministically evaluates versioned rules from assessment scores. The initial API outline also allowed an individual recommendation to be retrieved by a generated identifier, but the MVP has no independent recommendation workflow, assignment, or lifecycle. Persisting recommendations in two services would create ambiguous ownership and risk historical results changing when rules evolve.

## Decision

The recommendation service is a stateless evaluator. It owns version-controlled rule definitions but no runtime business data. On completion, the assessment service sends dimension scores and explicit policy versions for evaluation, then stores the returned recommendations as value objects inside the immutable assessment result.

Each recommendation contains a stable `ruleId`, triggering dimension and score, priority, rationale, and action. It has no generated recommendation identifier and no independent lookup endpoint. Historical retrieval occurs through `GET /api/v1/assessments/{assessmentId}/results`.

## Alternatives considered

- Persist each recommendation in the recommendation service: supports an independent lifecycle, but duplicates result ownership without an MVP use case.
- Re-evaluate rules whenever a result is retrieved: avoids snapshots, but allows historical output to drift and makes results less explainable.
- Store only rule identifiers in the assessment result: compact, but requires old rule content to remain operationally available for every historical result.

## Consequences and trade-offs

Completed results remain stable and independently retrievable. The recommendation service can scale horizontally without a database. Assessment result records are larger because they snapshot recommendation text. If recommendations later gain assignment, completion tracking, or standalone URLs, a new ADR must define that lifecycle and migration.

## Confirmation

- The recommendation contract exposes evaluation but no individual lookup operation.
- Recommendation response objects have `ruleId` but no generated `id`.
- Assessment result contracts embed complete recommendation snapshots.
- Phase 1 tests verify that a stored result is unchanged after rule definitions change.

