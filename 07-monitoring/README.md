# 07 — Monitoring & Observability

> You can't fix what you can't see. This module covers the three pillars of observability — metrics, logs, and traces — and how to set them up on your cluster.

## What You'll Learn

- The three pillars: metrics, logs, traces
- Prometheus + Grafana for metrics and dashboards
- Loki + Promtail for log aggregation
- OpenTelemetry for distributed tracing
- Alerting with AlertManager
- Kubernetes event monitoring

---

## 1. The Three Pillars

```
┌────────────────────────────────────────────────────────┐
│                    Observability                        │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   METRICS     │  │     LOGS     │  │    TRACES    │  │
│  │  (Prometheus) │  │  (Loki/ELK)  │  │ (OpenTelemetry)│ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│  │ CPU: 75%     │  │ 2024-01-01   │  │ Request ──►   │  │
│  │ Memory: 2GB  │  │ ERROR: DB    │  │  ├─ API 5ms  │  │
│  │ RPS: 1500    │  │ connection   │  │  ├─ DB 20ms │  │
│  │ Latency: 95ms│  │ timeout      │  │  └─ Cache 2ms│  │
│  │ 5xx: 0.1%    │  │              │  │              │  │
│  │             │  │              │  │              │  │
│  │ "What?"     │  │ "Why?"       │  │ "Where?"     │  │
│  │ What's slow?│  │ What broke?  │  │ Which service│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Prometheus Stack (kube-prometheus-stack)

The most popular monitoring setup includes Prometheus, Grafana, AlertManager, and node exporters.

### Installation

```bash
# Add the Prometheus community helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install the stack
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace

# Wait for everything to be ready
kubectl -n monitoring get pods
```

### Access Grafana

```bash
# Port-forward to Grafana
kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80

# Open http://localhost:3000
# Default credentials: admin / prom-operator
```

### Default Dashboards

The kube-prometheus-stack ships with dashboards for:

- **Kubernetes / Compute Resources / Namespace (Pods)** — see pod CPU/memory/network
- **Kubernetes / Compute Resources / Node** — see node utilization
- **Kubernetes / Networking** — network traffic per pod
- **Kubernetes / API Server** — control plane health
- **USE Method / Node** — node utilization, saturation, errors
- **1.5-1-1 Rule** — the most important metrics at a glance

---

## 3. Metrics That Matter

### RED Method (For Services)

| Metric | What | Example |
|--------|------|---------|
| **Rate** | Requests per second | 1500 req/s |
| **Errors** | Failed requests (5xx, 4xx) | 0.5% error rate |
| **Duration** | Latency distribution | P50: 20ms, P95: 100ms, P99: 500ms |

### USE Method (For Infrastructure)

| Metric | What | Example |
|--------|------|---------|
| **Utilization** | % of resource being used | CPU: 70%, Memory: 80% |
| **Saturation** | Queue depth or pressure | Load average, disk I/O wait |
| **Errors** | Error count | Disk errors, OOM events |

### Golden Signals

1. **Latency** — Time to serve a request (distinguish success vs error latency!)
2. **Traffic** — Demand on your system (RPS, active connections)
3. **Errors** — Rate of failed requests (explicit 5xx, implicit slow responses)
4. **Saturation** — How "full" your service is

---

## 4. Instrumenting Your Application

### Expose Metrics Endpoint

```javascript
// Node.js with prom-client
const prometheus = require('prom-client');

// Collect default metrics (CPU, memory, event loop lag)
prometheus.collectDefaultMetrics();

// Custom counter
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

// Custom histogram (latency)
const httpRequestDurationSeconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],  // in seconds
});

// Middleware
app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, path: req.path, status: res.statusCode });
    end({ method: req.method, path: req.path, status: res.statusCode });
  });
  next();
});

// Metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

### Annotate your service for scraping

```yaml
# In your Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"     # Prometheus should scrape this
        prometheus.io/port: "3000"       # Scrape port
        prometheus.io/path: "/metrics"   # Metrics endpoint
```

---

## 5. Logging with Loki

### Install Loki + Promtail

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Loki (log storage) + Promtail (log collector)
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set grafana.enabled=false \
  --set prometheus.enabled=false
```

### How it works

```
Pod ──► stdout/stderr ──► Promtail (daemonset) ──► Loki ──► Grafana
                                 (one per node)      (store)    (query)
```

Promtail runs on every node, reads container log files, and pushes them to Loki. You query logs in Grafana using LogQL.

### LogQL Queries

```logql
# All logs from a namespace
{namespace="myapp"}

# Logs from a specific pod
{pod="api-7d8f9c-x3k2m"}

# Error logs in the last hour
{app="api"} |= "ERROR" |= "connection" | logfmt

# Rate of errors
rate({app="api"} |= "ERROR" [5m])

# Latency > 500ms from JSON logs
{app="api"} | json | duration > 0.5
```

### Structured Logging (Best Practice)

```javascript
// ✅ Good — structured JSON logs
console.log(JSON.stringify({
  level: 'info',
  message: 'request completed',
  method: 'GET',
  path: '/users',
  status: 200,
  duration: 45,
  requestId: 'abc-123',
}));

// ❌ Bad — unstructured text
console.log('GET /users completed in 45ms');
```

Structured logs let you filter, aggregate, and alert on specific fields.

---

## 6. Distributed Tracing with OpenTelemetry

Tracing shows you the full path of a request across multiple services.

```
Browser ──► API Gateway ──► Users Service ──► DB
                   │                │
                   ▼                ▼
              Orders Service    Cache
                   │
                   ▼
              Payment Service
```

### Install OpenTelemetry Collector

```bash
# Install the OpenTelemetry operator
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml

# Create an OpenTelemetry Collector instance
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: collector
spec:
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318
    exporters:
      logging:
        loglevel: debug
    service:
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [logging]
EOF
```

### Instrument Your App

```javascript
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
  instrumentations: [
    new ExpressInstrumentation(),
  ],
});
```

For production tracing, export to **Jaeger**, **Tempo**, or **Datadog**.

---

## 7. Alerting with AlertManager

### Built-in Alerts (kube-prometheus-stack)

After installing the stack, these alerts come pre-configured:

| Alert | Condition | Severity |
|-------|-----------|----------|
| `KubePodCrashLooping` | Pod in CrashLoopBackOff > 15m | critical |
| `KubeCPUOvercommit` | Overcommitted CPU > 150% | warning |
| `KubeMemoryOvercommit` | Overcommitted memory > 150% | warning |
| `KubeNodeNotReady` | Node not ready > 15m | critical |
| `KubeDeploymentReplicasMismatch` | Mismatched replicas for 15m | critical |
| `KubePersistentVolumeFillingUp` | PV filling > 3% in 24h | critical |

### Custom Alert Rule

```yaml
# custom-alert.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: api-alerts
  namespace: monitoring
spec:
  groups:
    - name: api.rules
      rules:
        - alert: HighErrorRate
          expr: |
            rate(http_requests_total{status=~"5.."}[5m])
            /
            rate(http_requests_total[5m])
            > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate on {{ \$labels.instance }}"
            description: "Error rate is {{ \$value | humanizePercentage }} over 5m"

        - alert: HighLatency
          expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "P95 latency > 500ms on {{ \$labels.instance }}"

        - alert: InstanceDown
          expr: up{job="api"} == 0
          for: 1m
          labels:
            severity: critical
```

### Alert Notification Channels

```yaml
# alertmanager-config.yaml
apiVersion: v1
kind: Secret
metadata:
  name: alertmanager-monitoring-alertmanager
  namespace: monitoring
stringData:
  alertmanager.yaml: |
    global:
      slack_api_url: 'https://hooks.slack.com/services/...'
    route:
      receiver: 'default'
      routes:
        - match:
            severity: critical
          receiver: 'pagerduty'
    receivers:
      - name: 'default'
        slack_configs:
          - channel: '#alerts'
            title: '{{ .GroupLabels.alertname }}'
            text: '{{ .CommonAnnotations.description }}'
      - name: 'pagerduty'
        pagerduty_configs:
          - routing_key: '...'
```

---

## 8. Kubernetes Events

K8s events tell you what happened in the cluster — scheduling, scaling, probe failures.

```bash
# See all events
kubectl get events --sort-by='.lastTimestamp'

# Watch events in real-time
kubectl get events -w

# Events for a specific resource
kubectl describe pod my-pod     # Events section at the bottom

# Events with JSON output
kubectl get events -o json | jq '.items[] | {message, reason, type, lastTimestamp}'
```

### Event Export (EventRouter)

For production, export events to your monitoring system:

```bash
helm install eventrouter vmware-tanzu/eventrouter \
  --namespace monitoring \
  --set sinks.stdout.enabled=false \
  --set sinks.s3.enabled=true
```

---

## 9. Minimal Monitoring Setup (for Kind)

The full stack is heavy for local learning. Here's a lightweight option:

```bash
# Install just Prometheus (no Grafana)
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: prometheus
  namespace: monitoring
  labels:
    app: prometheus
spec:
  containers:
  - name: prometheus
    image: prom/prometheus
    args:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
    - containerPort: 9090
EOF

# Query metrics
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Open http://localhost:9090 and query:
#   rate(http_requests_total[5m])
#   container_cpu_usage_seconds_total{namespace="default"}
```

Or just use `kubectl top` for a quick check during learning:

```bash
kubectl top pods
kubectl top nodes
kubectl describe pod my-pod | grep -A5 Events
```

---

## Health Check Cheat Sheet

```bash
# Cluster health
kubectl get componentstatuses
kubectl cluster-info

# Node health
kubectl top nodes
kubectl describe node worker | grep -A5 Conditions

# Pod health
kubectl top pods
kubectl get pods --field-selector=status.phase!=Running

# Application health
kubectl get pods -l app=myapp -o wide
kubectl logs deployment/myapp --tail=50
kubectl exec deployment/myapp -- wget -qO- localhost:3000/health
```

---

**Next:** [Module 08 — Production Hardening](../08-production/README.md)

**Reference:** [Prometheus docs](https://prometheus.io/docs/) | [Grafana docs](https://grafana.com/docs/) | [OpenTelemetry](https://opentelemetry.io/docs/) | [LogQL](https://grafana.com/docs/loki/latest/logql/)
