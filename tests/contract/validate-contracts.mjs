import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const contracts = {
  "content-service.openapi.json": ["/api/v1/dimensions", "/api/v1/dimensions/{dimensionId}", "/api/v1/topics", "/api/v1/topics/{topicId}", "/api/v1/questionnaires/current"],
  "assessment-service.openapi.json": ["/api/v1/assessments", "/api/v1/assessments/{assessmentId}", "/api/v1/assessments/{assessmentId}/responses", "/api/v1/assessments/{assessmentId}/complete", "/api/v1/assessments/{assessmentId}/results"],
  "recommendation-service.openapi.json": ["/api/v1/recommendations/evaluate"]
};

let canonicalProblem;

for (const [file, businessPaths] of Object.entries(contracts)) {
  const document = JSON.parse(readFileSync(resolve(root, "contracts/openapi", file), "utf8"));
  if (document.openapi !== "3.1.0") throw new Error(`${file}: expected OpenAPI 3.1.0`);
  if (!document.info?.title || !/^1\.0\.0$/.test(document.info?.version)) throw new Error(`${file}: invalid info metadata`);
  if (!Array.isArray(document.servers) || document.servers.length === 0) throw new Error(`${file}: server context is missing`);
  if (!Array.isArray(document.security) || document.security.length !== 0) throw new Error(`${file}: anonymous MVP must declare empty root security`);
  for (const path of [...businessPaths, "/health/live", "/health/ready", "/metrics"]) {
    if (!document.paths?.[path]) throw new Error(`${file}: missing ${path}`);
  }
  const operationIds = [];
  for (const [path, item] of Object.entries(document.paths)) {
    if (path.startsWith("/api/") && !path.startsWith("/api/v1/")) throw new Error(`${file}: unversioned business path ${path}`);
    for (const [method, operation] of Object.entries(item)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      if (!operation.operationId) throw new Error(`${file}: ${method.toUpperCase()} ${path} lacks operationId`);
      if (!operation.summary) throw new Error(`${file}: ${method.toUpperCase()} ${path} lacks summary`);
      if (path.startsWith("/api/")) {
        const responseCodes = Object.keys(operation.responses ?? {});
        if (!responseCodes.some((code) => code === "default" || /^[45][0-9]{2}$/.test(code))) {
          throw new Error(`${file}: ${method.toUpperCase()} ${path} lacks a documented error response`);
        }
      }
      operationIds.push(operation.operationId);
    }
  }
  if (new Set(operationIds).size !== operationIds.length) throw new Error(`${file}: duplicate operationId`);
  if (!document.components?.schemas?.Problem) throw new Error(`${file}: missing Problem schema`);
  if (!document.components?.schemas?.Health) throw new Error(`${file}: missing Health schema`);
  const problem = document.components.schemas.Problem;
  for (const field of ["type", "title", "status", "code", "requestId"]) {
    if (!problem.required?.includes(field)) throw new Error(`${file}: Problem must require ${field}`);
  }
  if (problem.properties?.status?.minimum !== 400 || problem.properties?.status?.maximum !== 599) {
    throw new Error(`${file}: Problem status must be bounded to HTTP errors`);
  }
  canonicalProblem ??= JSON.stringify(problem);
  if (JSON.stringify(problem) !== canonicalProblem) throw new Error(`${file}: Problem schema differs from the shared API profile`);

  const resolvePointer = (pointer) => pointer.slice(2).split("/").reduce((value, token) => value?.[token.replaceAll("~1", "/").replaceAll("~0", "~")], document);
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (typeof value.$ref === "string" && value.$ref.startsWith("#/") && !resolvePointer(value.$ref)) {
      throw new Error(`${file}: unresolved reference ${value.$ref}`);
    }
    for (const child of Object.values(value)) visit(child);
  };
  visit(document);
  console.log(`${file}: ${operationIds.length} operations validated.`);
}

const recommendation = JSON.parse(readFileSync(resolve(root, "contracts/openapi/recommendation-service.openapi.json"), "utf8"));
if (recommendation.paths["/api/v1/recommendations/{recommendationId}"]) throw new Error("Recommendation lookup must not exist without an independent lifecycle");
if (recommendation.components.schemas.Recommendation.properties.id) throw new Error("Recommendation value objects must not have generated IDs");

const assessment = JSON.parse(readFileSync(resolve(root, "contracts/openapi/assessment-service.openapi.json"), "utf8"));
if (assessment.components.schemas.Recommendation.properties.id) throw new Error("Stored recommendation snapshots must not have generated IDs");
for (const field of ["ruleId", "dimensionId", "triggerScore", "priority", "rationale", "action"]) {
  if (!assessment.components.schemas.Recommendation.required.includes(field)) throw new Error(`Assessment recommendation snapshot is missing ${field}`);
}

const conventions = readFileSync(resolve(root, "contracts/openapi/README.md"), "utf8");
for (const term of ["X-Request-ID", "RFC 9457", "idempotent", "deterministic", "request-body", "Retry-After"]) {
  if (!conventions.includes(term)) throw new Error(`API conventions do not define ${term}`);
}

const resultExample = JSON.parse(readFileSync(resolve(root, "contracts/examples/assessment-result.json"), "utf8"));
if (resultExample.recommendations.some((item) => "id" in item)) throw new Error("Assessment result example contains a generated recommendation ID");
if (resultExample.recommendations.length < 3) throw new Error("Assessment result example must contain prioritized recommendations");

const problemExample = JSON.parse(readFileSync(resolve(root, "contracts/examples/problem.json"), "utf8"));
for (const field of ["type", "title", "status", "code", "requestId"]) {
  if (!(field in problemExample)) throw new Error(`Problem example is missing ${field}`);
}
