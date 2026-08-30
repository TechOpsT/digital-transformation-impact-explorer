import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "../..");
const services = [
  ["content-service.openapi.json", "http://localhost:8001"],
  ["assessment-service.openapi.json", "http://localhost:8002"],
  ["recommendation-service.openapi.json", "http://localhost:8003"]
];

for (const [filename, baseUrl] of services) {
  const contract = JSON.parse(readFileSync(resolve(root, "contracts/openapi", filename), "utf8"));
  const response = await fetch(`${baseUrl}/openapi.json`);
  assert.equal(response.status, 200, `${filename} runtime OpenAPI was unavailable`);
  const runtime = await response.json();
  for (const [path, pathItem] of Object.entries(contract.paths)) {
    assert.ok(runtime.paths[path], `${filename} runtime is missing ${path}`);
    for (const method of Object.keys(pathItem)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      assert.ok(runtime.paths[path][method], `${filename} runtime is missing ${method.toUpperCase()} ${path}`);
      assert.equal(runtime.paths[path][method].operationId, pathItem[method].operationId, `${filename} operationId drift at ${method.toUpperCase()} ${path}`);
    }
  }
  console.log(`${filename}: runtime paths and operation IDs match.`);
}
