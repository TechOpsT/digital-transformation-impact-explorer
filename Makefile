.PHONY: help lint contract-test test setup run build integration-test helm-lint

help:
	@echo "setup, lint, contract-test, test, run, build, integration-test"
	@echo "helm-lint becomes available in Phase 2"

setup:
	npm ci
	npm ci --prefix apps/web

lint:
	node scripts/check-repository.mjs
	npm run lint --prefix apps/web

contract-test:
	npm run contract-test

test:
	node --test tests/unit/*.test.mjs
	npm test --prefix apps/web
	docker build --target test --tag transformation-content-test --file services/content-service/Dockerfile .
	docker run --rm transformation-content-test
	docker build --target test --tag transformation-assessment-test --file services/assessment-service/Dockerfile .
	docker run --rm transformation-assessment-test
	docker build --target test --tag transformation-recommendation-test --file services/recommendation-service/Dockerfile .
	docker run --rm transformation-recommendation-test

run:
	docker compose up --build

build:
	npm run build --prefix apps/web
	docker compose build

integration-test:
	docker compose up --detach --build --wait
	node tests/contract/runtime-contracts.mjs
	node tests/integration/walking-skeleton.mjs
	docker compose down

helm-lint:
	@echo "helm-lint becomes available in Phase 2" && exit 2
