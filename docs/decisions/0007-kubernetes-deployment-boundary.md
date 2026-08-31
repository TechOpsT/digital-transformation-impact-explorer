# ADR 0007: Kubernetes deployment boundary

## Status

Status: Accepted

Date: 2026-08-30

Decision owner: Project owner

## Context

Phase 2 must deploy the Phase 1 workload to the existing Enterprise Platform Lab without duplicating cluster-owned ingress, monitoring, logging, GitOps, or policy systems. The lab uses Kind, NGINX Ingress, the `standard` local-path StorageClass, kube-prometheus-stack, Grafana, Loki, Alloy, and restricted pod-security conventions.

## Decision drivers

- Preserve application ownership while consuming platform capabilities.
- Keep secrets and persistent-data lifecycle explicit.
- Demonstrate least privilege, network isolation, health-gated rollout, and resource governance.
- Avoid implementing Phase 3 image publication and GitOps promotion early.
- Keep local Kubernetes installation reproducible and removable.

## Decision

Package the complete workload as one application Helm chart installed into the dedicated `transformation-explorer` namespace. The chart owns the web and three API Deployments, Services, ServiceAccounts, NetworkPolicies, PodDisruptionBudgets, ingress, PostgreSQL StatefulSet and PVC, ephemeral Redis, migration/seed Jobs, ServiceMonitor, and Grafana dashboard ConfigMap.

The namespace enforces the restricted Pod Security Standard. Workloads use dedicated ServiceAccounts with token automount disabled, non-root execution, RuntimeDefault seccomp, dropped capabilities, read-only root filesystems where compatible, resource requests and limits, and explicit probes.

Only the web Service is exposed through the platform NGINX ingress at `transformation.local`; its existing proxy routes reach internal APIs. Default-deny ingress and egress policies permit only DNS and documented application flows.

Database credentials are supplied through a pre-created Secret named by `database.existingSecret`. The chart never contains or generates credential values. PostgreSQL is a single-replica, local-path-backed lab StatefulSet; Redis remains reconstructable and ephemeral. Database migrations and deterministic seed data run as bounded Helm hook Jobs rather than application startup actions.

Phase 2 loads locally built, immutable-tagged images into Kind. GHCR publication and Argo CD promotion remain Phase 3 work.

## Alternatives considered

- Extend the Enterprise Platform Lab chart: rejected because application resources belong with application source and release history.
- Package each service as a separate chart: deferred because the MVP is released as one product and does not yet need independent chart lifecycles.
- Store development passwords in Helm values: rejected because the public repository must not contain credentials.
- Deploy a second ingress controller or observability stack: rejected because these are shared platform capabilities.
- Run migrations in every application pod: rejected because migration execution must be deliberate and single-purpose.

## Consequences and trade-offs

- The chart is independently testable and consumes existing platform APIs cleanly.
- Initial local installation requires creating the namespace and Secret before Helm installation.
- Local Kind images are not portable to another cluster until Phase 3 publishes them.
- The single PostgreSQL replica and local-path volume are intentionally not production-grade.
- Alloy currently discovers only the platform's original namespace; adding this namespace to centralized log collection requires an approved change in the Enterprise Platform Lab repository.

## Confirmation

Confirm with strict Helm lint, deterministic rendering checks, Kubernetes server-side dry run, successful hook Jobs, ready workloads, ingress-based end-to-end testing, NetworkPolicy inspection, Prometheus target discovery, dashboard discovery, and documented uninstall behavior.
