.PHONY: help lint contract-test test setup run build integration-test helm-lint

help:
	@echo "Phase 0: lint, contract-test, test"
	@echo "Phase 1+: setup, run, build, integration-test"
	@echo "Phase 2+: helm-lint"

lint:
	node scripts/check-repository.mjs

contract-test:
	node tests/contract/validate-contracts.mjs

test:
	node --test tests/unit/*.test.mjs

setup run build integration-test helm-lint:
	@echo "$@ is not available in Phase 0" && exit 2

