import assert from "node:assert/strict";

const content = "http://localhost:8001";
const assessment = "http://localhost:8002";

async function json(url, init) {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", "X-Request-ID": "phase-1-walking-skeleton" } });
  if (!response.ok) {
    const body = await response.text();
    assert.fail(`${init?.method ?? "GET"} ${url} returned ${response.status}: ${body}`);
  }
  assert.equal(response.headers.get("x-request-id"), "phase-1-walking-skeleton");
  return response.json();
}

const questionnaire = await json(`${content}/api/v1/questionnaires/current`);
const started = await json(`${assessment}/api/v1/assessments`, { method: "POST", body: JSON.stringify({ questionnaireVersion: questionnaire.version }) });
await json(`${assessment}/api/v1/assessments/${started.id}/responses`, { method: "POST", body: JSON.stringify({ responses: questionnaire.questions.map((question, index) => ({ questionId: question.id, optionId: question.options[index % question.options.length].id })) }) });
const completed = await json(`${assessment}/api/v1/assessments/${started.id}/complete`, { method: "POST" });
assert.equal(completed.dimensionScores.length, 6);
assert.equal(completed.recommendations.length, 3);
assert.equal(completed.recommendationRuleSetVersion, "recommendations-1.0.0");
const revisited = await json(`${assessment}/api/v1/assessments/${started.id}/results`);
assert.deepEqual(revisited, completed);
const repeated = await json(`${assessment}/api/v1/assessments/${started.id}/complete`, { method: "POST" });
assert.deepEqual(repeated, completed);
console.log(`Walking skeleton completed and revisited assessment ${started.id}.`);
