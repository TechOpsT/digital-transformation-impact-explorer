# Kubernetes deployment runbook

## Scope

Install, validate, upgrade, roll back, and remove the application on the local Enterprise Platform Lab Kind cluster. The commands assume the `kind-platform-lab` context and do not publish images or modify shared platform releases.

## Preconditions

- Docker Desktop, Kind, kubectl, Helm, NGINX ingress, and the `standard` StorageClass are available.
- The active context is `kind-platform-lab`.
- Monitoring CRDs exist when `monitoring.serviceMonitor.enabled=true`.
- Four strong local-only database passwords are available in the current shell and are not written to a file.

## Build and load immutable local images

```text
docker build --target runtime -t transformation-explorer-web:phase2-5151de2-v2 -f apps/web/Dockerfile .
docker build --target runtime -t transformation-explorer-content:phase2-5151de2 -f services/content-service/Dockerfile .
docker build --target runtime -t transformation-explorer-assessment:phase2-5151de2 -f services/assessment-service/Dockerfile .
docker build --target runtime -t transformation-explorer-recommendation:phase2-5151de2 -f services/recommendation-service/Dockerfile .
kind load docker-image --name platform-lab transformation-explorer-web:phase2-5151de2-v2 transformation-explorer-content:phase2-5151de2 transformation-explorer-assessment:phase2-5151de2 transformation-explorer-recommendation:phase2-5151de2
```

## Prepare the namespace and Secret

Create and label the namespace before creating the Secret. Substitute shell variables or interactive values; never copy real values into Git or Helm values.

```text
kubectl create namespace transformation-explorer
kubectl label namespace transformation-explorer pod-security.kubernetes.io/enforce=restricted pod-security.kubernetes.io/audit=restricted pod-security.kubernetes.io/warn=restricted
kubectl -n transformation-explorer create secret generic transformation-explorer-database --from-literal=POSTGRES_SUPERUSER_PASSWORD=<value> --from-literal=CONTENT_DATABASE_PASSWORD=<value> --from-literal=ASSESSMENT_DATABASE_PASSWORD=<value> --from-literal=MIGRATION_DATABASE_PASSWORD=<value>
```

## Install

```text
helm upgrade --install transformation-explorer charts/transformation-explorer --namespace transformation-explorer --values charts/transformation-explorer/values-kind.yaml --set namespace.create=false --wait=hookOnly --timeout 10m
kubectl wait --for=condition=complete job/content-migrate job/assessment-migrate job/content-seed -n transformation-explorer --timeout=5m
kubectl rollout status statefulset/postgres -n transformation-explorer --timeout=5m
kubectl rollout status deployment/web deployment/content deployment/assessment deployment/recommendation deployment/redis -n transformation-explorer --timeout=5m
```

Add `127.0.0.1 transformation.local` to the local hosts file, or test without changing it using `curl -H "Host: transformation.local" http://127.0.0.1/`.

## Validate

```text
helm test transformation-explorer -n transformation-explorer
kubectl get pods,svc,ingress,pvc,networkpolicy,pdb -n transformation-explorer
node tests/kubernetes/cluster-smoke.mjs
kubectl get servicemonitor -n monitoring transformation-explorer
kubectl get configmap -n monitoring transformation-explorer-dashboard
```

## Upgrade and rollback

Use a new immutable tag in a values file or `--set` override. Pre-upgrade hooks apply migrations and seed definitions before workloads roll.

```text
helm upgrade transformation-explorer charts/transformation-explorer --namespace transformation-explorer --values charts/transformation-explorer/values-kind.yaml --wait --timeout 10m
helm history transformation-explorer -n transformation-explorer
helm rollback transformation-explorer <revision> -n transformation-explorer --wait --timeout 10m
```

Database migrations must remain backward compatible with the version being rolled back. Helm rollback does not reverse durable data.

## Remove

```text
helm uninstall transformation-explorer -n transformation-explorer
```

The PostgreSQL PVC and namespace are intentionally retained. Deleting either destroys or makes persistent assessment data unavailable and requires explicit authorization after verifying the exact target.
