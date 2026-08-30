# ADR 0002: Data ownership

- Status: Proposed

## Context

The services need independent ownership without requiring multiple PostgreSQL clusters in the local lab.

## Decision

Use one PostgreSQL instance with separate `content`, `assessment`, and `recommendation` schemas and distinct least-privilege database roles. A service may access only its schema. Cross-service reads use versioned HTTP APIs. Redis holds only reconstructable cache entries with explicit TTLs.

## Alternatives considered

- Separate PostgreSQL instances: strongest isolation, higher local and operational cost.
- Shared public schema: simplest setup, but weak ownership and encourages direct coupling.
- Database per service on one instance: stronger logical isolation, with more migration and local setup complexity.

## Consequences and trade-offs

Schema isolation is economical for the lab but not a security boundary equivalent to separate instances. Cross-service workflows need explicit failure handling and cannot rely on database joins.

