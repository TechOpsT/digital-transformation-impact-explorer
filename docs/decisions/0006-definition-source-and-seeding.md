# ADR 0006: Definition source and deterministic seeding

- Status: Accepted
- Date: 2026-08-30
- Decision owner: Repository owner

## Context

Questionnaires, scoring inputs, educational content, and recommendation rules must be reviewable, versioned, reproducible, and available without introducing an authoring system during the MVP. Content service data still needs to exercise PostgreSQL ownership and migrations on the platform. Recommendation evaluation must remain stateless as established by ADR 0005.

## Decision drivers

- Reviewable changes in Git
- Deterministic local and deployed environments
- Immutable published questionnaire and rule-set versions
- Real PostgreSQL behavior in the content service
- No unnecessary content-management or recommendation database

## Decision

Store canonical content, questionnaire definitions, and recommendation rules as version-controlled data files validated against schemas.

The content service imports its definitions into its PostgreSQL schema through an explicit, idempotent seed command after migrations. A published definition version is immutable; changes create a new version. The recommendation service validates and loads its packaged rule-set files at startup and fails readiness when the configured version cannot be loaded. Assessment results snapshot all definition versions used.

Seed execution is separate from application startup and safe to rerun. It may add missing immutable versions and verify existing content, but it must not silently rewrite or delete published versions.

## Alternatives considered

- Serve all content directly from files: simpler, but does not exercise content persistence or database ownership.
- Build an administrative content-management API: supports live authoring, but adds authentication, authorization, audit, and UI scope without an MVP need.
- Store recommendation rules in PostgreSQL: permits runtime edits, but conflicts with the stateless evaluator and weakens reviewability.

## Consequences and trade-offs

Definition changes use the code-review and delivery workflow rather than live editing. PostgreSQL contents are reproducible from Git, and recommendation replicas behave consistently. The repository grows with content history; a future authoring workflow requires a new ADR and migration strategy.

## Confirmation

- CI validates every canonical definition file and rejects duplicate version identifiers.
- Seeding an empty content schema twice produces the same records without mutation errors.
- Tests prove published definitions cannot be overwritten by a seed with different content.
- Recommendation readiness fails for missing, malformed, or unknown configured rule-set versions.

