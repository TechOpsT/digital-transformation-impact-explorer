# ADR 0004: Repository structure

- Status: Proposed

## Context

The application components change together during early development but must remain independently buildable and deployable.

## Decision

Use a monorepo containing the frontend, three backend services, OpenAPI contracts, tests, and the application Helm chart. Keep shared cluster tooling and GitOps platform configuration in the Enterprise Platform Lab repository.

## Alternatives considered

- Repository per service: independent history and permissions, with substantial coordination overhead for an early-stage portfolio project.
- Application code in the platform repository: simpler discovery, but mixes workload and platform lifecycles.

## Consequences and trade-offs

Atomic contract and consumer changes are easy, but CI must preserve independent build boundaries and path-aware validation as the repository grows.

