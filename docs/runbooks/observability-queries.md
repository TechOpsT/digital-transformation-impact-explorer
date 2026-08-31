# Phase 2 observability queries

## Metrics

The chart creates a `ServiceMonitor` in `monitoring` and a Grafana dashboard ConfigMap. Useful PromQL queries include:

```text
sum(rate(http_requests_total{namespace="transformation-explorer"}[5m])) by (service)
sum(rate(http_requests_total{namespace="transformation-explorer",status_class="5xx"}[5m])) by (service)
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{namespace="transformation-explorer"}[5m])) by (le, service))
sum(increase(assessment_completions_total{namespace="transformation-explorer"}[1h]))
sum(increase(recommendation_evaluations_total{namespace="transformation-explorer"}[1h])) by (status)
```

## Logs

Once the platform-owned Alloy discovery list includes `transformation-explorer`, useful LogQL queries are:

```text
{namespace="transformation-explorer"} | json
{namespace="transformation-explorer", container="assessment"} | json | message="request_completed"
sum by (service, severity) (count_over_time({namespace="transformation-explorer"} | json [5m]))
```

Alloy currently limits discovery to the original `platform-lab` namespace. This application repository does not alter that shared platform configuration; the platform repository must approve and record the namespace addition before centralized-log evidence can pass.
