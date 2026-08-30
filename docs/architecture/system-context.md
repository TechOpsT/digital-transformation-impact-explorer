# System context

```text
Browser
  ├─ GET content/questionnaire ───────────────→ Content service
  ├─ create/respond/complete/get result ─────→ Assessment service
  │                                               │
  │                                               └─ evaluate scores ─→ Recommendation service
  └─ renders content and explainable results

Content service ───── owns content schema ─────┐
Assessment service ─ owns assessment schema ───┴─ PostgreSQL
Recommendation service ─ version-controlled rules; no runtime database
Services ──────────── reconstructable caches ───── Redis
```

Ingress routing, observability backends, secrets integration, and GitOps controllers are owned by the Enterprise Platform Lab. Phase 0 defines contracts only; runtime topology begins in Phase 1 and Kubernetes resources in Phase 2.
