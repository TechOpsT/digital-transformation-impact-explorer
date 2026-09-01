# Digital Transformation Impact Explorer

I built this cloud-native learning and assessment app to explore what digital transformation actually changes inside a software-driven organization. It also gives me a realistic workload for testing and improving the Enterprise Platform Lab.

## Status

**Phase 2 is complete.** The app now has its own Helm release, and I have validated it on the Enterprise Platform Lab's local Kind cluster. Phase 3 is next, but I have not started it yet.

## Product scope

The first version is anonymous and lets someone:

- learn across six dimensions: software delivery, reliability and operations, security and governance, data and decision-making, developer experience, and organizational culture;
- complete a versioned maturity questionnaire;
- receive explainable overall and per-dimension scores; and
- revisit deterministic, prioritized recommendations using a stable result identifier.

Under the hood, I am using a React frontend, three focused backend services, PostgreSQL, and Redis. For this stage of the project, the services talk over straightforward HTTP/JSON calls.

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
3. GitOps, supply-chain security, and policy enforcement
   - Publish immutable images and promote releases through Argo CD.
   - Onboard the application to platform-owned Kyverno policies, beginning in audit mode and moving agreed controls to enforcement.
   - Validate restricted workload settings, approved image sources, immutable image references, required resource limits, and policy reporting in CI and on the cluster.
4. Reliability, tracing, backup, and recovery
   - Add service-level objectives, tracing, operational dashboards, and alerts.
   - Onboard application Kubernetes resources and persistent volumes to platform-owned Velero backup schedules.
   - Define database-native backup requirements, recovery-point and recovery-time objectives, retention, and an evidence-backed restore drill; Velero is not the sole PostgreSQL backup mechanism.
5. Product depth

I finish and validate one phase before moving to the next.

Kyverno and Velero will live in the Enterprise Platform Lab because they serve the whole cluster, not just this app. On this side, I will keep the app-specific policies, labels, backup rules, recovery expectations, and proof that everything works as intended.

## Local development

To run the project locally, you will need Node.js 20+, Docker Desktop with Compose, and GNU Make if it is available on your system. Start by creating a local environment file and replacing each placeholder:

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

These are the main validation commands I use:

```bash
make lint
make contract-test
make test
make build
make integration-test
make helm-lint
make kubernetes-smoke
```

The full Kubernetes install, upgrade, rollback, and removal process is in `docs/runbooks/kubernetes-deployment.md`. Right now I load immutable images directly into Kind. Publishing them to GHCR and promoting them with Argo CD comes in Phase 3.

On Windows without `make`, the equivalent frontend and static checks include:

```powershell
node scripts/check-repository.mjs
npm run contract-test
node --test tests/unit/*.test.mjs
npm run lint --prefix apps/web
npm test --prefix apps/web
npm run build --prefix apps/web
```

The backend and integration tests run in Docker, so you do not need Python installed on the host.

## Architecture decisions

I keep the reasoning behind the larger technical choices in `docs/decisions/`. ADRs 0001–0007 cover the backend framework, data ownership, migrations, repository layout, stable recommendation results, versioned seed data, and the Kubernetes deployment boundary. Open choices stay documented until the phase where I have enough information to make them well.

## Security and privacy

The MVP is anonymous, and I do not want it collecting personal or organizational data it does not need. Do not commit credentials, tokens, private keys, connection strings, or a populated `.env` file.

## License

Licensed under the MIT License. See `LICENSE`.
