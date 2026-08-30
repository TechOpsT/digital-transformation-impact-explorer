# Digital Transformation Impact Explorer

A cloud-native learning and assessment application that explains how digital transformation affects software-driven organizations. It is designed as the primary real-world workload for the Enterprise Platform Lab.

## Status

**Phase 0 complete — awaiting approval to begin Phase 1.** Architecture, domain and scoring specifications, user flows, service contracts, accepted foundational decisions, validation tooling, and reproducible evidence are present. No runtime application has been implemented yet.

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

## Phase 0 validation

The Phase 0 checks require Node.js 20+. Install the pinned validation dependency once:

```bash
npm ci
```

Then run:

```bash
make lint
make contract-test
make test
```

On Windows without `make`, run:

```powershell
node scripts/check-repository.mjs
npm run contract-test
node --test tests/unit/*.test.mjs
```

## Architecture decisions

ADRs 0001–0006 are accepted. They establish the backend framework, data ownership, migration tooling, repository structure, immutable recommendation snapshots, and version-controlled definition seeding. Remaining questions are intentionally deferred to their documented decision boundaries.

## Security and privacy

The MVP is anonymous and must not collect unnecessary personal or organizational data. Never commit credentials, tokens, private keys, connection strings, or populated `.env` files.

## License

License selection is deferred until the intended publication model is confirmed and must be completed before public release.
