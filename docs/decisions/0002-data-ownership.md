# ADR 0002: Data ownership

- Status: Accepted
- Date: 2026-08-30
- Decision owner: Repository owner

## Decision drivers

- Explicit service ownership and least privilege
- Affordable local-lab resource use
- No cross-service database coupling
- Explainable historical assessment results
- Reconstructable caching only

## Context

The services need independent ownership without requiring multiple PostgreSQL clusters in the local lab.

## Decision

Use one PostgreSQL instance with separate `content` and `assessment` schemas and distinct least-privilege database roles. A service may access only its schema. Cross-service reads use versioned HTTP APIs. The recommendation service is stateless and owns version-controlled rules as established by ADR 0005. Redis holds only reconstructable cache entries with explicit TTLs.

## Alternatives considered

- Separate PostgreSQL instances: strongest isolation, higher local and operational cost.
- Shared public schema: simplest setup, but weak ownership and encourages direct coupling.
- Database per service on one instance: stronger logical isolation, with more migration and local setup complexity.

## Consequences and trade-offs

Schema isolation is economical for the lab but not a security boundary equivalent to separate instances. Cross-service workflows need explicit failure handling and cannot rely on database joins. Recommendation availability does not depend on a third business-data schema.

## Confirmation

- Integration tests use distinct database roles and prove cross-schema access is denied.
- No service code or migration references another service's schema.
- Assessment results snapshot all policy versions and recommendation values required for retrieval.
- Redis loss does not remove durable business data or prevent recovery from PostgreSQL.
