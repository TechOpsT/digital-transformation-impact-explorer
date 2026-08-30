# Phase 1 validation evidence

## Purpose

Demonstrate that the walking-skeleton implementation is internally consistent, testable, and ready for Docker-backed integration validation.

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

`docker compose config --quiet` passed with local placeholder values. The live image build, migrations, deterministic seed job, runtime contract checks, and end-to-end walking-skeleton test were not executed because Docker Desktop's Linux engine did not respond on this workstation during validation.

## Limitations and follow-up

Phase 1 remains in development until Docker-backed validation passes. When the container engine is available, run `make integration-test` (or the equivalent Compose and Node commands above), then capture the command results here before declaring Phase 1 complete. The Python test runner also emitted a non-failing Starlette warning that its current `httpx` TestClient compatibility layer is deprecated in favor of `httpx2`; this should be reviewed during the next dependency refresh.
