# Phase 0 review: ambiguities and open questions

No direct conflicts were found between the project brief and repository instructions. The following choices are intentionally unresolved or proposed:

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

The initial recommendation lookup ambiguity is resolved by ADR 0005. The endpoint and generated recommendation identifiers were removed before implementation.
