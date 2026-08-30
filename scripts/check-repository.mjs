import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const required = [
  "AGENTS.md",
  "README.md",
  "Makefile",
  ".gitignore",
  ".github/workflows/phase-0-validation.yml",
  "package.json",
  "package-lock.json",
  "redocly.yaml",
  ".dockerignore",
  ".gitattributes",
  ".env.example",
  ".github/workflows/phase-1-validation.yml",
  "compose.yaml",
  "apps/web/package.json",
  "apps/web/package-lock.json",
  "apps/web/Dockerfile",
  "apps/web/src/App.tsx",
  "apps/web/src/styles.css",
  "definitions/content-1.0.0.json",
  "definitions/questionnaire-1.0.0.json",
  "definitions/recommendations-1.0.0.json",
  "docs/architecture/frontend-design.md",
  "services/content-service/Dockerfile",
  "services/content-service/requirements.lock",
  "services/content-service/migrations/versions/0001_content_definitions.py",
  "services/assessment-service/Dockerfile",
  "services/assessment-service/requirements.lock",
  "services/assessment-service/migrations/versions/0001_assessments.py",
  "services/recommendation-service/Dockerfile",
  "services/recommendation-service/requirements.lock",
  "tests/contract/validate-definitions.mjs",
  "tests/contract/runtime-contracts.mjs",
  "tests/integration/walking-skeleton.mjs",
  "docs/architecture/domain-model.md",
  "docs/architecture/scoring-specification.md",
  "docs/architecture/user-flows.md",
  "docs/architecture/open-questions.md",
  "docs/decisions/0001-backend-framework.md",
  "docs/decisions/0002-data-ownership.md",
  "docs/decisions/0003-migration-tooling.md",
  "docs/decisions/0004-repository-structure.md",
  "docs/decisions/0005-recommendation-lifecycle.md",
  "docs/decisions/0006-definition-source-and-seeding.md",
  "docs/evidence/phase-0-completion.md",
  "docs/evidence/phase-1-validation.md",
  "docs/evidence/phase-1-completion.md",
  "contracts/openapi/README.md",
  "contracts/examples/assessment-result.json",
  "contracts/examples/problem.json",
  "contracts/openapi/content-service.openapi.json",
  "contracts/openapi/assessment-service.openapi.json",
  "contracts/openapi/recommendation-service.openapi.json"
];

const missing = required.filter((path) => !existsSync(resolve(root, path)));
if (missing.length) throw new Error(`Missing required files:\n${missing.join("\n")}`);

for (const path of required.filter((path) => path.includes("docs/decisions/"))) {
  const content = readFileSync(resolve(root, path), "utf8");
  for (const heading of ["Status", "Context", "Decision", "Alternatives considered", "Consequences and trade-offs"]) {
    if (!content.includes(heading)) throw new Error(`${path} is missing ${heading}`);
  }
  if (content.includes("Status: Accepted")) {
    for (const field of ["Date:", "Decision owner:", "Decision drivers", "Confirmation"]) {
      if (!content.includes(field)) throw new Error(`${path} accepted decision is missing ${field}`);
    }
  }
}

const forbidden = ["PRIVATE KEY-----", "ghp_", "postgres://admin:", "local-migration-password", "local-content-password", "local-assessment-password"];
for (const path of required) {
  const content = readFileSync(resolve(root, path), "utf8");
  for (const marker of forbidden) {
    if (content.includes(marker)) throw new Error(`${path} contains forbidden secret-like content`);
  }
}

console.log(`Repository convention check passed (${required.length} required files).`);
