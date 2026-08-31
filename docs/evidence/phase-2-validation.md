# Phase 2 validation evidence

## Environment

- Date: 2026-08-30
- Kubernetes context: `kind-platform-lab`
- Release: `transformation-explorer`, namespace `transformation-explorer`, Helm revision 4
- Ingress: `transformation.local` through the platform NGINX controller
- Images: locally loaded immutable Phase 2 tags, as recorded in `values-kind.yaml`

## Repository and chart validation

| Check | Result |
| --- | --- |
| `npm run lint` | Passed; 66 required files before adding this evidence, then 68 afterward |
| `npm run contract-test` | Passed; all 20 OpenAPI operations and versioned definitions validated |
| `npm test` | Passed; 5 scoring tests |
| Frontend TypeScript lint, Vitest, and production build | Passed; 3 component tests and successful Vite build |
| Content service container test | Passed; 4 tests |
| Assessment service container test | Passed; 4 tests |
| Recommendation service container test | Passed; 4 tests |
| `helm lint charts/transformation-explorer --strict` | Passed; informational icon recommendation only |
| `node tests/kubernetes/validate-chart.mjs` | Passed |
| Server-side dry run of the rendered chart | Passed for all non-test resources |

GNU Make was unavailable on the Windows host. The exact commands represented by the required Makefile targets were run individually; the unavailable wrapper itself is not reported as passing.

## Live deployment validation

| Check | Result |
| --- | --- |
| Helm upgrade | Passed; release revision 4 is deployed |
| Hook Jobs | Content migration, assessment migration, and content seed completed |
| Workload readiness | Web, content, assessment, and recommendation each have 2 ready replicas; PostgreSQL and Redis are ready |
| Persistence | PostgreSQL PVC `data-postgres-0` is Bound with 1 Gi on StorageClass `standard` |
| Security controls | Restricted namespace, numeric non-root identities, disabled token automount, seccomp, dropped capabilities, resource governance, and explicit probes rendered and accepted |
| Network isolation | Default deny plus nine explicit flow policies installed |
| Availability controls | Four PodDisruptionBudgets each permit one disruption |
| `helm test transformation-explorer -n transformation-explorer --logs` | Passed |
| `node tests/kubernetes/cluster-smoke.mjs` | Passed; an assessment was created, answered, completed, and revisited through ingress |
| Idempotent seed | `content.definitions` count was 2 before upgrade and 2 afterward |

## Observability

The ServiceMonitor and Grafana dashboard ConfigMap were discovered in the platform monitoring namespace. The Prometheus targets API reported both replicas of content, assessment, and recommendation healthy, for six active `/metrics` targets with no scrape errors.

Centralized logging is a documented platform integration dependency, not an application chart defect. The platform-owned Alloy configuration currently discovers only `platform-lab`; this repository does not alter shared platform configuration. The required follow-up and useful LogQL queries are documented in `docs/runbooks/observability-queries.md`.

## Data and teardown boundary

No credentials were written to source, Helm values, or evidence. The pre-created Kubernetes Secret remains the credential source. The release is intentionally left running, and the populated PostgreSQL PVC is retained. Removal of the PVC or namespace requires explicit destructive-action approval.
