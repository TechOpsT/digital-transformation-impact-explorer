# Open questions

I use this page to keep track of decisions that are still open, along with the point in the roadmap when I expect to have enough context to make them.

| Topic | Current Phase 0 position | Decision needed before |
| --- | --- | --- |
| Backend framework | Resolved by ADR 0001: Python, FastAPI, and Pydantic with framework-independent domain logic | — |
| Data and schema isolation | Resolved by ADR 0002: separate content and assessment schemas and roles | — |
| Migration runner | Resolved by ADR 0003: per-service Alembic with deliberate execution | — |
| Repository structure | Resolved by ADR 0004: application monorepo with independent component builds | — |
| Definition source | Resolved by ADR 0006: version-controlled definitions with explicit content seeding and packaged recommendation rules | — |
| Recommendation persistence | Resolved by ADR 0005: complete snapshots belong to immutable assessment results; the evaluator is stateless | — |
| Stable result-link privacy | Results are anonymous and non-secret; retention and deletion policy remain open | Shared deployment |
| Open-source license | Deferred until publication intent is confirmed | First public release |
| CI action pinning | Major tags are acceptable for Phase 0; full SHA pinning is required in the supply-chain phase | Phase 3 |
| Kyverno policy baseline | Platform-owned Kyverno will provide admission policy and reporting; select the application policy set, exceptions, audit-to-enforce criteria, and CI validation approach | Phase 3 |
| Backup and recovery objectives | Platform-owned Velero will protect Kubernetes resources and eligible volumes, supplemented by database-native PostgreSQL backups; define RPO, RTO, retention, encryption, restore ownership, and drill cadence | Phase 4 |

ADR 0005 settled the earlier question about recommendation lookup. I removed the extra endpoint and generated recommendation IDs before implementation because they did not have a useful lifecycle of their own.
