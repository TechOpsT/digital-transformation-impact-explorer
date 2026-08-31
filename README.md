# Digital Transformation Impact Explorer

A cloud-native learning and assessment application that explains how digital transformation affects software-driven organizations. It is designed as the primary real-world workload for the Enterprise Platform Lab.

## Status

**Phase 2 — complete.** The application is packaged as an application-owned Helm release and has been validated on the local Enterprise Platform Lab Kind cluster. Phase 3 has not started and remains behind an explicit approval boundary.

## Product scope

The anonymous MVP will let users:

- learn across six dimensions: software delivery, reliability and operations, security and governance, data and decision-making, developer experience, and organizational culture;
- complete a versioned maturity questionnaire;
- receive explainable overall and per-dimension scores; and
- revisit deterministic, prioritized recommendations using a stable result identifier.

The intended deployable components are a React web frontend, content service, assessment service, recommendation service, PostgreSQL, and Redis. Synchronous HTTP/JSON is the MVP communication pattern.

## Repository map

```text
apps/web/                         React frontend (Phase 1)
services/                         Backend services (Phase 1)
charts/transformation-explorer/  Kubernetes Helm package (Phase 2)
contracts/openapi/                Versioned service contracts
docs/architecture/                Domain, scoring, and user-flow specifications
docs/decisions/                   Architecture decision records
docs/evidence/                    Reproducible validation evidence
docs/runbooks/                    Operational procedures
docs/slo/                         Reliability objectives
tests/contract/                   Contract validation
.github/workflows/                CI validation
```

## Phase plan

0. Architecture and contracts
1. Walking skeleton
2. Kubernetes deployment
3. GitOps and supply-chain security
4. Reliability and tracing
5. Product depth

Each phase ends with validation and an explicit approval boundary.

## Local development

Requirements: Node.js 20+, Docker Desktop with Compose, and GNU Make where available. Create an ignored local environment file and replace every placeholder:

```bash
cp .env.example .env
```

Install pinned JavaScript dependencies:

```bash
npm ci
```

Start the complete local application:

```bash
docker compose up --build
```

Open `http://localhost:5173`. The service APIs are exposed on ports 8001–8003 for local inspection.

## Validation

The repository interface is:

```bash
make lint
make contract-test
make test
make build
make integration-test
make helm-lint
make kubernetes-smoke
```

The Kubernetes installation, upgrade, rollback, and removal procedure is documented in `docs/runbooks/kubernetes-deployment.md`. Phase 2 uses locally loaded immutable image tags; GHCR publication and Argo CD promotion begin in Phase 3.

On Windows without `make`, the equivalent frontend and static checks include:

```powershell
node scripts/check-repository.mjs
npm run contract-test
node --test tests/unit/*.test.mjs
npm run lint --prefix apps/web
npm test --prefix apps/web
npm run build --prefix apps/web
```

Backend and integration tests run in Docker so a host Python installation is not required.

## Architecture decisions

ADRs 0001–0007 are accepted. They establish the backend framework, data ownership, migration tooling, repository structure, immutable recommendation snapshots, version-controlled definition seeding, and the Kubernetes deployment boundary. Remaining questions are intentionally deferred to their documented decision boundaries.

## Security and privacy

The MVP is anonymous and must not collect unnecessary personal or organizational data. Never commit credentials, tokens, private keys, connection strings, or populated `.env` files.

## License

Licensed under the MIT License. See `LICENSE`.
