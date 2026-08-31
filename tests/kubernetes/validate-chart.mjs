import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const chart = resolve(root, "charts/transformation-explorer");
const rendered = execFileSync("helm", ["template", "transformation-explorer", chart, "--values", resolve(chart, "values-kind.yaml")], { encoding: "utf8" });

for (const kind of ["Namespace", "Deployment", "StatefulSet", "Service", "ServiceAccount", "NetworkPolicy", "PodDisruptionBudget", "Ingress", "ServiceMonitor", "Job"]) {
  assert.match(rendered, new RegExp(`kind: ${kind}\\b`), `missing ${kind}`);
}
for (const component of ["web", "content", "assessment", "recommendation", "postgres", "redis"]) {
  assert.match(rendered, new RegExp(`app.kubernetes.io/component: ${component}\\b`), `missing ${component}`);
}
for (const control of ["automountServiceAccountToken: false", "readOnlyRootFilesystem: true", "allowPrivilegeEscalation: false", 'drop: ["ALL"]', "type: RuntimeDefault", "resources:", "startupProbe:", "readinessProbe:", "livenessProbe:"]) {
  assert.ok(rendered.includes(control), `missing security or operability control: ${control}`);
}
assert.ok(!rendered.includes("kind: Secret"), "chart must not render credentials");
assert.ok(!rendered.includes(":latest"), "rendered workloads must not use latest tags");
assert.match(rendered, /name: default-deny/);
assert.match(rendered, /host: "transformation\.local"/);
console.log("Rendered chart includes the required Phase 2 workload, security, networking, and observability resources.");
