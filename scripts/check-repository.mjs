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
  "docs/architecture/domain-model.md",
  "docs/architecture/scoring-specification.md",
  "docs/architecture/user-flows.md",
  "docs/architecture/open-questions.md",
  "docs/decisions/0001-backend-framework.md",
  "docs/decisions/0002-data-ownership.md",
  "docs/decisions/0003-migration-tooling.md",
  "docs/decisions/0004-repository-structure.md",
  "docs/decisions/0005-recommendation-lifecycle.md",
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
}

const forbidden = ["PRIVATE KEY-----", "ghp_", "postgres://admin:"];
for (const path of required) {
  const content = readFileSync(resolve(root, path), "utf8");
  for (const marker of forbidden) {
    if (content.includes(marker)) throw new Error(`${path} contains forbidden secret-like content`);
  }
}

console.log(`Repository convention check passed (${required.length} required files).`);
