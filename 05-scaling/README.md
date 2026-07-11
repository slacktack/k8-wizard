# 05 — Scaling

> One replica isn't production. This module covers how Kubernetes scales your applications — automatically, based on real metrics, across multiple nodes.

## What You'll Learn

- Horizontal Pod Autoscaler (HPA): scale out/in based on CPU/memory/custom metrics
- Vertical Pod Autoscaler (VPA): right-size pod resources automatically
- Cluster Autoscaler: add/remove nodes as needed
- Load testing your cluster to trigger scaling

---

## 1. The Three Autoscalers

```
┌──────────────────────────────────────────────────────┐
│                  Cluster Autoscaler                    │
│  Adds/removes NODES when pods can't be scheduled      │
│                                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │           Horizontal Pod Autoscaler               │ │
│  │  Adds/removes PODS based on metrics              │ │
│  │                                                   │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │     Vertical Pod Autoscaler                   │ │ │
│  │  │  Adjusts CPU/MEMORY REQUESTS for pods        │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

| Autoscaler | What It Scales | Trigger | Speed |
|------------|---------------|---------|-------|
| **HPA** | Pod replicas | CPU, memory, custom metrics, external metrics | Seconds |
| **VPA** | Resource requests/limits | Historical usage, OOM events | Minutes |
| **Cluster** | Worker nodes | Unschedulable pods, underutilized nodes | Minutes |

---

## 2. Horizontal Pod Autoscaler (HPA)

The most important one. HPA automatically adjusts the number of pod replicas based on observed metrics.

### How HPA Works

```
Every 15 seconds (default):
  1. Metrics Server collects CPU/memory from each pod
  2. HPA controller calculates:
       desiredReplicas = ceil(currentReplicas × currentMetricValue / targetMetricValue)
  3. Updates the Deployment's replicas field
  4. Deployment creates/deletes pods accordingly
```

### Prerequisites: Metrics Server

HPA needs the Metrics Server to collect pod resource metrics.

```bash
# Install Metrics Server (needed for HPA to work)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For Kind, add the --kubelet-insecure-tls flag
kubectl patch deployment metrics-server -n kube-system \
  --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Verify
kubectl top pods
kubectl top nodes
```

### HPA Based on CPU

```yaml
# hpa-cpu.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2                  # Always keep at least 2
  maxReplicas: 10                 # Never exceed 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70  # Scale when CPU > 70% average
```

**How this works:**

```
CPU > 70% for all pods → HPA increases replicas → CPU per pod drops
CPU < 70% for all pods → HPA decreases replicas → CPU per pod rises (watch out!)
```

### HPA Based on Memory

```yaml
metrics:
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### HPA Based on Custom Metrics (Requests Per Second)

This requires a custom metrics adapter (Prometheus + Prometheus Adapter).

```yaml
metrics:
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: 100    # Scale when RPS > 100 per pod
```

**Production note:** Custom metrics are the most reliable scaling signal for web services. CPU scaling is a proxy — RPS scaling is direct.

### Multiple Metrics

```yaml
metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

HPA scales to the **highest** desired replica count across all metrics.

### Create and Test HPA

```bash
# Create deployment with resource requests (HPA won't work without these)
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: hashicorp/http-echo:latest
        args: ["-text=ok"]
        ports:
        - containerPort: 5678
        resources:
          requests:
            cpu: "100m"
            memory: "64Mi"
          limits:
            cpu: "200m"
            memory: "128Mi"
EOF

# Create HPA
kubectl autoscale deployment api \
  --min=2 --max=10 \
  --cpu-percent=50

# Or create from YAML
kubectl apply -f hpa-cpu.yaml

# Watch HPA
kubectl get hpa -w
# NAME     REFERENCE       TARGETS    MINPODS   MAXPODS   REPLICAS
# api-hpa  Deployment/api  20%/50%    2         10        2

# Generate load to trigger scaling
kubectl run load-generator --rm -it --image=busybox -- sh
# Inside the pod:
while true; do wget -q -O- http://api:5678; done
```

Watch the HPA in another terminal:

```bash
kubectl get hpa -w
# After ~60 seconds, you'll see:
# api-hpa  Deployment/api  120%/50%   2         10        4
# api-hpa  Deployment/api  150%/50%   2         10        8
```

---

## 3. HPA Tuning

### Behavior (Stabilization)

Prevents flapping — rapid scale up and down.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300    # Wait 5 min before scaling down
      policies:
        - type: Percent
          value: 10                       # Only scale down 10% per minute
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0       # Scale up immediately
      policies:
        - type: Pods
          value: 4                        # Add up to 4 pods per minute
          periodSeconds: 60
        - type: Percent
          value: 100                      # Or double, whichever is higher
          periodSeconds: 60
      selectPolicy: Max                   # Use the policy that allows most scaling
```

### Cooldown

HPA has built-in cooldown:

- **Scale up:** immediate (default)
- **Scale down:** waits 5 minutes after metric drops below target
- You control this with `stabilizationWindowSeconds`

---

## 4. Vertical Pod Autoscaler (VPA)

VPA sets **resource requests** automatically based on historical usage. Use when you don't know what resources your app needs.

```yaml
# vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  updatePolicy:
    updateMode: Auto           # Or "Off" (recommend only) or "Initial"
  resourcePolicy:
    containerPolicies:
      - containerName: '*'
        minAllowed:
          cpu: "50m"
          memory: "64Mi"
        maxAllowed:
          cpu: "2"
          memory: "4Gi"
```

### VPA Modes

| Mode | Behavior |
|------|----------|
| `Off` | Only recommend values — you apply manually |
| `Initial` | Set values at pod creation only, never change running pods |
| `Auto` | Evict and recreate pods with new recommendations |

### When to use HPA vs VPA

| Use HPA When | Use VPA When |
|-------------|-------------|
| Your app scales horizontally (stateless) | Your app is hard to horizontally scale |
| You have predictable load patterns | You're unsure about resource requirements |
| Custom metrics like RPS are important | Spiky resource usage (periodic batch jobs) |
| Stateless microservices | Stateful workloads (databases) |

**Best practice:** Use HPA for stateless services. Use VPA in `Off` mode to get recommendations, then set requests manually.

---

## 5. Cluster Autoscaler

Adds nodes when pods can't be scheduled. Removes nodes when they're underutilized.

### How it works

```
1. Pod is Pending (all nodes have insufficient resources)
2. Cluster Autoscaler sees the unschedulable pod
3. Requests a new node from the cloud provider
4. Node joins the cluster
5. K8s schedules the pod on the new node
6. When utilization drops, CA cordons and drains nodes
```

### Production Setup

In the cloud (EKS, AKS, GKE), it integrates with the cloud provider:

```bash
# EKS (AWS)
eksctl create cluster --node-group-type=spot --nodes-min=2 --nodes-max=20

# AKS (Azure)
az aks create --enable-cluster-autoscaler --min-count 2 --max-count 20

# GKE (Google)
gcloud container clusters create --autoscaling --min-nodes=2 --max-nodes=20
```

### In Kind

Cluster Autoscaler doesn't work with Kind (no cloud to provision nodes). But you can simulate:

```bash
# Add a new node container manually
kind create node --name learn --image kindest/node:v1.27.3
```

---

## 6. Load Testing Your Cluster

### Using k6 (Modern, scriptable)

```bash
# Run a k6 load test from within the cluster
kubectl run k6 --rm -it --image=grafana/k6 -- run - <<EOF
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '3m', target: 100 },   // Stay at 100
    { duration: '2m', target: 200 },   // Ramp to 200
    { duration: '1m', target: 0 },     // Ramp down
  ],
};

export default function () {
  http.get('http://api:3000');
  sleep(1);
}
EOF
```

### Using Hey (Simple HTTP load)

```bash
# Install hey
brew install hey

# Run from a pod inside the cluster
kubectl run hey --rm -it --image=ghcr.io/rakyll/hey -- \
  -n 10000 -c 100 http://api:3000/health
# 10,000 requests, 100 concurrent workers
```

---

## 7. Complete Scaling Demo

```bash
# 1. Create a kind cluster with 3 workers
kind create cluster --name scaling-demo --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
  - role: worker
EOF

# 2. Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system \
  -p='{"spec":{"template":{"spec":{"containers":[{"name":"metrics-server","args":["--kubelet-insecure-tls","--kubelet-preferred-address-types=InternalIP"]}]}}}}'

# 3. Deploy a CPU-intensive app
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cpu-loader
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cpu-loader
  template:
    metadata:
      labels:
        app: cpu-loader
    spec:
      containers:
      - name: app
        image: containerstack/cpustress:latest
        args: ["--cpu", "4", "--timeout", "30m", "--metrics-brief"]
        resources:
          requests:
            cpu: "500m"
            memory: "128Mi"
          limits:
            cpu: "1"
            memory: "256Mi"
EOF

# 4. Create HPA
kubectl autoscale deployment cpu-loader --min=1 --max=10 --cpu-percent=50

# 5. Watch it scale
kubectl get hpa -w &
kubectl get pods -w &
```

---

## Scaling Anti-Patterns

| ❌ Anti-Pattern | ✅ Fix |
|----------------|--------|
| HPA without resource requests | Always set `requests` on all containers |
| Setting limits too low (OOMKilled loops) | Use VPA in `Off` mode to find the right values |
| Scaling based only on CPU for web apps | Add custom metrics (RPS, latency) |
| Too many small replicas (e.g. 50 × 128MB) | Fewer, larger pods are more efficient |
| Instant scale-down after load spike | Add `stabilizationWindowSeconds` on scale down |
| Ignoring P99 latency during scale-up | Load test with realistic traffic patterns |

---

**Next:** [Module 06 — Storage & Stateful Workloads](../06-storage/README.md)

**Reference:** [HPA walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/) | [VPA](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler) | [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)
