# Phase 0 validation evidence

## Purpose

Demonstrate that repository conventions, contract structure, and executable scoring examples agree with the Phase 0 specifications.

## Preconditions

- Node.js 20 or later
- Repository checkout at the version being evaluated

## Procedure

```text
node scripts/check-repository.mjs
node tests/contract/validate-contracts.mjs
node --test tests/unit/*.test.mjs
```

## Expected result

All commands exit zero. Each OpenAPI document is valid JSON with required service paths, versioned `/api/v1` business routes, health endpoints, and the shared machine-readable error schema.

## Observed result

Executed on 2026-08-30 with Node.js 24.17.0. All three commands exited zero. The repository check found all 15 required files, contract validation checked 21 operations across three contracts, and all five scoring tests passed.

## Limitations

This structural validator is not a complete OpenAPI 3.1 schema validator. Runtime contract conformance begins in Phase 1.
