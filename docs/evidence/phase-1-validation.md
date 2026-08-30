# Phase 1 validation evidence

## Purpose

Demonstrate that the walking-skeleton implementation is internally consistent and passes its Docker-backed integration gate.

## Preconditions

- Node.js 20 or later
- Python 3.12 or later with the service development dependencies installed
- Docker Desktop with a responsive Linux container engine for runtime integration checks
- Repository checkout at the version being evaluated

## Procedure

```text
npm run lint
npm run contract-test
npm test
npm --prefix apps/web run lint
npm --prefix apps/web test -- --run
npm --prefix apps/web run build
python -m pytest -q  # in each service directory with the repository on PYTHONPATH
python -m compileall -q services
docker compose config --quiet
docker compose up --build --wait
node tests/contract/runtime-contracts.mjs
node tests/integration/walking-skeleton.mjs
```

The interface was also inspected at desktop and mobile widths in a real browser, including the backend-unavailable error state.

## Expected result

Static checks, OpenAPI and definition validation, unit and component tests, Python service tests, frontend production build, Compose configuration, runtime contract tests, and the anonymous assessment journey all exit zero. The browser interface remains legible and usable at desktop and mobile widths.

## Observed result

Executed on 2026-08-30. Repository conventions passed for 51 required files; all three OpenAPI 3.1 documents and the versioned definitions validated; five scoring tests, three frontend tests, and twelve Python service tests passed; Python byte-compilation and JavaScript syntax checks passed; and the frontend production build completed. Desktop and mobile browser inspection passed for layout, responsive navigation, visual hierarchy, and the dependency-error state. The blue, navy, teal, and amber palette remained accessible and cohesive across both viewport sizes.

`docker compose config --quiet` passed with local validation values. Docker 29.4.0 and Compose 5.1.2 built all application images. PostgreSQL 17.6 and Redis 8.2.1 became healthy; both Alembic migrations and the content seed job exited zero; all three services became healthy; and the web container started successfully. Runtime contract checks matched every implemented path and operation ID to its OpenAPI document. The walking-skeleton test created an assessment, submitted responses, completed it, verified six dimension scores and three recommendations, revisited the immutable result, and confirmed that repeating completion returns the same result.

The content seed job was run two additional times against the initialized database. The definition count remained at two before and after both runs, confirming idempotent upsert behavior without duplicates.

The Docker gate identified and resolved three integration defects before completion: PostgreSQL readiness could pass during its temporary initialization server, Alembic attempted to keep its version table in the unowned `public` schema, and Compose built the final Dockerfile test stage instead of the production runtime stage. The final configuration waits for an initialization-completion marker, keeps migration history in each service-owned schema, and explicitly targets the runtime stage.

## Limitations and follow-up

Phase 1 is complete. The Python host test runner emitted a non-failing Starlette warning that its current `httpx` TestClient compatibility layer is deprecated in favor of `httpx2`; this should be reviewed during the next dependency refresh. Kubernetes deployment, GitOps, supply-chain controls, distributed tracing, and production reliability evidence remain intentionally deferred to later phases.
