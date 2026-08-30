import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const contracts = {
  "content-service.openapi.json": ["/api/v1/dimensions", "/api/v1/questionnaires/current"],
  "assessment-service.openapi.json": ["/api/v1/assessments", "/api/v1/assessments/{assessmentId}/complete", "/api/v1/assessments/{assessmentId}/results"],
  "recommendation-service.openapi.json": ["/api/v1/recommendations/evaluate", "/api/v1/recommendations/{recommendationId}"]
};

for (const [file, businessPaths] of Object.entries(contracts)) {
  const document = JSON.parse(readFileSync(resolve(root, "contracts/openapi", file), "utf8"));
  if (document.openapi !== "3.1.0") throw new Error(`${file}: expected OpenAPI 3.1.0`);
  if (!document.info?.title || !/^1\.0\.0$/.test(document.info?.version)) throw new Error(`${file}: invalid info metadata`);
  for (const path of [...businessPaths, "/health/live", "/health/ready", "/metrics"]) {
    if (!document.paths?.[path]) throw new Error(`${file}: missing ${path}`);
  }
  const operationIds = [];
  for (const [path, item] of Object.entries(document.paths)) {
    if (path.startsWith("/api/") && !path.startsWith("/api/v1/")) throw new Error(`${file}: unversioned business path ${path}`);
    for (const [method, operation] of Object.entries(item)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      if (!operation.operationId) throw new Error(`${file}: ${method.toUpperCase()} ${path} lacks operationId`);
      operationIds.push(operation.operationId);
    }
  }
  if (new Set(operationIds).size !== operationIds.length) throw new Error(`${file}: duplicate operationId`);
  if (!document.components?.schemas?.Problem) throw new Error(`${file}: missing Problem schema`);
  if (!document.components?.schemas?.Health) throw new Error(`${file}: missing Health schema`);
  console.log(`${file}: ${operationIds.length} operations validated.`);
}

