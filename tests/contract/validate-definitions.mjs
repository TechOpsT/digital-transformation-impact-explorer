import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "../..");
const read = (name) => JSON.parse(readFileSync(resolve(root, "definitions", name), "utf8"));
const content = read("content-1.0.0.json");
const questionnaire = read("questionnaire-1.0.0.json");
const recommendations = read("recommendations-1.0.0.json");
const expected = ["software-delivery", "reliability-and-operations", "security-and-governance", "data-and-decision-making", "developer-experience", "organizational-culture"];

assert.deepEqual(content.dimensions.map((item) => item.id), expected, "content must define the six dimensions in stable order");
assert.equal(new Set(questionnaire.questions.map((item) => item.id)).size, questionnaire.questions.length, "question IDs must be unique");
assert.deepEqual(new Set(questionnaire.questions.map((item) => item.dimensionId)), new Set(expected), "questionnaire must cover every dimension");
for (const question of questionnaire.questions) {
  assert.ok(question.options.length >= 2, `${question.id} needs at least two options`);
  assert.ok(question.options.every((option) => Number.isInteger(option.value) && option.value >= 0 && option.value <= 4), `${question.id} values must be integers from 0 through 4`);
}
assert.deepEqual(new Set(recommendations.rules.map((item) => item.dimensionId)), new Set(expected), "rules must cover every dimension");
assert.equal(new Set(recommendations.rules.map((item) => item.id)).size, recommendations.rules.length, "rule IDs must be unique");
console.log("Versioned content, questionnaire, and recommendation definitions validated.");
