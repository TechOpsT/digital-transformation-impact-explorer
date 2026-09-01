# System context

I keep the service boundaries narrow on purpose: content explains the subject, assessment owns a user's progress and results, and recommendation evaluates versioned rules. This diagram shows how those pieces fit together.

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

The Enterprise Platform Lab owns the shared pieces around the app: ingress, observability backends, secrets integration, and GitOps controllers. I introduced the runtime services in Phase 1 and the Kubernetes resources in Phase 2.
