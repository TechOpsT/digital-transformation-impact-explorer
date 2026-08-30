# Phase 0 validation evidence

## Purpose

Demonstrate that repository conventions, contract structure, and executable scoring examples agree with the Phase 0 specifications.

## Preconditions

- Node.js 20 or later
- Dependencies installed with `npm ci`
- Repository checkout at the version being evaluated

## Procedure

```text
node scripts/check-repository.mjs
npm run contract-test
node --test tests/unit/*.test.mjs
```

## Expected result

All commands exit zero. Redocly validates each OpenAPI document, and the domain validator checks required service paths, versioned `/api/v1` business routes, health endpoints, recommendation ownership, internal references, and the shared machine-readable error profile.

## Observed result

Executed on 2026-08-30 with Node.js 24.17.0 after the contract-hardening pass. All commands exited zero. The repository check found all 23 required files. Redocly validated all three OpenAPI 3.1 documents with no findings, the domain validator checked 20 operations and the recommendation-lifecycle invariants, and all five scoring tests passed. `npm audit` reported zero known vulnerabilities in the validation dependency tree at installation time.

## Limitations

Static validation cannot prove runtime conformance. Runtime request and response contract tests begin in Phase 1.
