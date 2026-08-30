# ADR 0003: Migration tooling

- Status: Proposed

## Context

Schema changes must be version-controlled, reproducible, and executed deliberately rather than during application startup.

## Decision

Use Alembic per data-owning service. Store migrations with each service and run them through an explicit local command and a dedicated Kubernetes migration Job. Migration identities must not be granted to runtime service accounts.

## Alternatives considered

- Raw SQL migrations: transparent and portable, but requires custom ordering and state management.
- Application-startup migrations: convenient, but unsafe with concurrent replicas and obscures deployment failures.
- A shared migration project: centralized, but breaks service ownership.

## Consequences and trade-offs

Each service owns a separate migration history. Delivery must sequence compatible expand-and-contract migrations before application rollout.

