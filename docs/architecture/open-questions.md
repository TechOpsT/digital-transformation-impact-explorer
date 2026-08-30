# Phase 0 review: ambiguities and open questions

No direct conflicts were found between the project brief and repository instructions. The following choices are intentionally unresolved or proposed:

| Topic | Current Phase 0 position | Decision needed before |
| --- | --- | --- |
| Backend framework | FastAPI proposed in ADR 0001 | Phase 1 implementation |
| Data and schema isolation | Separate PostgreSQL schemas and roles proposed in ADR 0002 | Phase 1 persistence |
| Migration runner | Per-service Alembic proposed in ADR 0003 | First schema creation |
| Repository structure | Application monorepo proposed in ADR 0004 | Phase 1 implementation |
| Content authoring source | Contract is defined; file-backed seed versus database authoring is open | Content-service persistence |
| Recommendation persistence | Resolved by ADR 0005: complete snapshots belong to immutable assessment results; the evaluator is stateless | — |
| Stable result-link privacy | Results are anonymous and non-secret; retention and deletion policy remain open | Shared deployment |
| Open-source license | Deferred until publication intent is confirmed | First public release |
| CI action pinning | Major tags are acceptable for Phase 0; full SHA pinning is required in the supply-chain phase | Phase 3 |

The initial recommendation lookup ambiguity is resolved by ADR 0005. The endpoint and generated recommendation identifiers were removed before implementation.
