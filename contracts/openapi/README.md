# API contract conventions

These conventions are normative for every API under this directory and supplement the service-specific OpenAPI documents.

## HTTP and resource semantics

- Business routes begin with `/api/v1`; operational routes remain unversioned.
- JSON request bodies reject unknown properties unless a schema explicitly permits extensions.
- Creation returns `201 Created` with `Location`; retrieval returns `200 OK`.
- `POST /assessments/{assessmentId}/responses` is an idempotent upsert by `questionId`. Replaying the same logical set produces the same stored responses; duplicate question IDs in one request return `422`.
- `POST /assessments/{assessmentId}/complete` is idempotent. The first valid call atomically stores the immutable result; later calls return that same result. Concurrent completion is serialized by the assessment service.
- Safe reads may be retried with bounded backoff. Clients may retry the two explicitly idempotent assessment writes after timeouts. Other writes are not retryable unless their operation contract says otherwise.
- Collection ordering is deterministic. Dimensions follow the published six-dimension order; questions follow questionnaire order; recommendations follow priority then `ruleId`; topics follow title then ID. These Phase 0 collections are deliberately bounded and do not require pagination. Pagination must be added before a collection becomes unbounded.

## Correlation and errors

- A client may send `X-Request-ID` containing 1–128 visible ASCII characters. A service validates it or generates a UUID, propagates it to dependencies, and returns it on every response.
- Errors use `application/problem+json` following RFC 9457. `type`, `title`, `status`, `code`, and `requestId` are required by this API profile; `code` and `requestId` are extension members.
- Problem `type` URIs must be stable and resolve to documentation before shared deployment. `instance` identifies an occurrence without exposing sensitive data.
- Validation problems may contain `errors` entries with `detail` and an RFC 6901 JSON Pointer in `pointer`.
- Known client errors are documented explicitly. Unexpected server failures use the operation's `default` problem response and never expose stack traces.

## Limits and availability

- Phase 1 must enforce configurable request-body and timeout limits. Exact ingress-wide rate limits belong to the platform integration phase; service-level write protection remains required before shared deployment.
- `503` responses caused by temporary dependencies include `Retry-After` when a useful estimate exists.
- Liveness checks process health only. Readiness checks required dependencies and returns `503` when the service cannot perform its work.

## Compatibility

- Additive changes are preferred within `/api/v1`.
- Removing fields, changing their meaning, tightening previously accepted input, or changing result calculations requires a new API or policy version as applicable.
- Runtime response schemas must be checked against these source-controlled contracts in Phase 1.

