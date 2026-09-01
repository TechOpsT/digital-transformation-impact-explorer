# Phase 2 observability queries

## Metrics

The chart creates a `ServiceMonitor` in `monitoring` and a Grafana dashboard ConfigMap. These are the PromQL queries I reach for most often:

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

One current limitation: Alloy only discovers the original `platform-lab` namespace. I am keeping that shared configuration in the Enterprise Platform Lab repository, so centralized logging for this app will stay incomplete until I add the namespace there and document the change.
