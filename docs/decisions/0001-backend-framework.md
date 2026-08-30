# ADR 0001: Backend framework

- Status: Accepted
- Date: 2026-08-30
- Decision owner: Repository owner

## Decision drivers

- Contract-first request and response validation
- Straightforward unit and API testing
- Mature ASGI support for graceful shutdown and concurrent dependency calls
- Clear separation between HTTP adapters and deterministic domain logic
- Low framework assembly cost for three small services

## Context

Three small HTTP services need strong request validation, generated OpenAPI support, async-capable dependency calls, metrics, and straightforward testing. The team has not yet established a backend convention.

## Decision

Use Python 3.13 with FastAPI and Pydantic for the content, assessment, and recommendation services. Keep domain logic independent of FastAPI handlers and persistence adapters. Pin direct and transitive dependencies with a committed lockfile in Phase 1.

## Alternatives considered

- Flask: smaller core, but more assembly is needed for validation and OpenAPI.
- Node.js with TypeScript: strong shared-language option with the frontend, but adds no clear advantage for the initial scoring-oriented services.
- A single backend: simpler deployment, but would not exercise the intended service ownership and platform workload.

## Consequences and trade-offs

FastAPI reduces contract and validation boilerplate, while adding framework conventions and an ASGI stack the team must operate. Contract files remain authoritative and require drift tests against runtime behavior in Phase 1.

## Confirmation

- Phase 1 pins Python, FastAPI, Pydantic, and ASGI server versions in a committed lockfile.
- Domain modules have no FastAPI imports.
- Runtime routes are tested against the source-controlled OpenAPI contracts.
- Each service demonstrates graceful shutdown and bounded outbound timeouts.
