import assert from "node:assert/strict";
import http from "node:http";

const base = process.env.TRANSFORMATION_EXPLORER_URL ?? "http://127.0.0.1";
const headers = { "Content-Type": "application/json", "Host": "transformation.local", "X-Request-ID": "phase-2-kubernetes-smoke" };

async function json(path, init = {}) {
  const response = await new Promise((resolve, reject) => {
    const request = http.request(`${base}${path}`, { method: init.method ?? "GET", headers }, (incoming) => {
      let body = "";
      incoming.setEncoding("utf8");
      incoming.on("data", (chunk) => { body += chunk; });
      incoming.on("end", () => resolve({ status: incoming.statusCode, body }));
    });
    request.on("error", reject);
    if (init.body) request.write(init.body);
    request.end();
  });
  if (response.status < 200 || response.status >= 300) assert.fail(`${init.method ?? "GET"} ${path} returned ${response.status}: ${response.body}`);
  return JSON.parse(response.body);
}

const questionnaire = await json("/api/content/questionnaires/current");
const started = await json("/api/assessments", { method: "POST", body: JSON.stringify({ questionnaireVersion: questionnaire.version }) });
await json(`/api/assessments/${started.id}/responses`, {
  method: "POST",
  body: JSON.stringify({ responses: questionnaire.questions.map((question, index) => ({ questionId: question.id, optionId: question.options[index % question.options.length].id })) })
});
const completed = await json(`/api/assessments/${started.id}/complete`, { method: "POST" });
assert.equal(completed.dimensionScores.length, 6);
assert.equal(completed.recommendations.length, 3);
assert.deepEqual(await json(`/api/assessments/${started.id}/results`), completed);
console.log(`Kubernetes ingress journey completed assessment ${started.id}.`);
