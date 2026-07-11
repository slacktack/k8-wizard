# 03 — Deploying Backends

> You've got a container and a cluster. Now let's deploy real backend services with health checks, environment injection, rolling updates, and zero-downtime deploys.

## What You'll Learn

- Deployment strategies: rolling update, recreate, blue/green, canary
- Health checks: liveness, readiness, startup probes
- Graceful shutdowns in your application code
- Injecting config and secrets
- Environment-specific configurations with Kustomize
- Debugging failing deployments

---

## 1. Deployment Strategies

### RollingUpdate (Default)

The standard way to update without downtime. K8s replaces pods gradually.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1        # Max pods that can be down during update
      maxSurge: 1              # Max extra pods above desired count
  ...
```

**How it works:**

```
Before:   [v1] [v1] [v1] [v1] [v1]
Step 1:   [v2] [v1] [v1] [v1] [v1]   # 1 new v2, 1 old removed
Step 2:   [v2] [v2] [v1] [v1] [v1]
Step 3:   [v2] [v2] [v2] [v1] [v1]
Step 4:   [v2] [v2] [v2] [v2] [v1]
Step 5:   [v2] [v2] [v2] [v2] [v2]   # All updated
```

### Recreate

All old pods are killed before new ones start. **Has downtime** — use only for development or when you can't run two versions simultaneously.

```yaml
strategy:
  type: Recreate
```

### Blue/Green

Two full environments: switch traffic atomically.

```
BLUE (current): [v1] [v1] [v1]  ← Service points here
GREEN (new):    [v2] [v2] [v2]  ← Deploy, test, then switch service

# Switch traffic in one command:
kubectl patch service api -p '{"spec":{"selector":{"version":"green"}}}'
```

### Canary

Roll out to a small subset first, monitor, then roll out to everyone.

```yaml
# canary deployment — 10% of traffic
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-canary
spec:
  replicas: 1          # vs 9 in the main deployment
  selector:
    matchLabels:
      app: api
      track: canary
  template:
    metadata:
      labels:
        app: api
        track: canary    # Different label than stable
    spec:
      containers:
        - name: api
          image: my-api:v2
---
# Service selects both (10% to canary via replica ratio)
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api            # Matches both stable and canary
```

---

## 2. Health Checks — The Three Probes

### Liveness Probe

Does the app need to be restarted? If it fails, K8s kills and recreates the pod.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10    # Wait before first check (app startup time)
  periodSeconds: 10           # Check every 10 seconds
  timeoutSeconds: 3           # Wait 3s for response
  failureThreshold: 3         # After 3 failures, restart
```

### Readiness Probe

Is the app ready to serve traffic? If it fails, the pod is removed from the Service (no traffic sent).

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 2
```

**Common pattern** — readiness checks dependencies (DB, cache), liveness just checks if the process is responsive:

```javascript
// Express example
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });     // Just process is alive
});

app.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');    // Check DB connection
    await redis.ping();            // Check cache
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
```

### Startup Probe (K8s 1.18+)

For slow-starting apps (JVM, legacy). Defers liveness checks until startup completes.

```yaml
startupProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 10
  failureThreshold: 30        # Give 5 minutes to start (30 × 10s)
```

### Summary: When do they fire?

```
Pod created ──► Startup (if defined) ──► Liveness + Readiness
                 │                              │
                 ▼                              ▼
          Skip liveness until          Ready = Traffic yes/no
          startup succeeds             Alive = Restart if dead
```

---

## 3. Graceful Shutdown

When K8s sends a SIGTERM to your pod (for rolling update, scale down, etc.), your app needs to:

1. Stop accepting new requests
2. Finish in-flight requests
3. Close database connections
4. Exit cleanly

```javascript
// Node.js Express
const server = app.listen(3000);

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('All connections closed');
    db.close();
    process.exit(0);
  });
  
  // Force shutdown after 30s (K8s sends SIGKILL after terminationGracePeriodSeconds)
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 25000);
});
```

Set the grace period in the pod spec:

```yaml
spec:
  terminationGracePeriodSeconds: 30   # Default is 30s
  containers:
    - name: app
      ...
```

---

## 4. Environment Injection Patterns

### ConfigMap (Non-sensitive)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  NODE_ENV: production
  LOG_LEVEL: info
  API_URL: https://internal-api.svc.cluster.local
---
apiVersion: apps/v1
kind: Deployment
...
spec:
  template:
    spec:
      containers:
        - name: api
          envFrom:
            - configMapRef:
                name: api-config
          # OR selectively:
          env:
            - name: NODE_ENV
              valueFrom:
                configMapKeyRef:
                  name: api-config
                  key: NODE_ENV
```

### Secrets (Sensitive)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
type: Opaque
stringData:               # stringData is auto-base64-encoded — cleaner
  DB_PASSWORD: s3cret!
  API_KEY: xyz-123
---
spec:
  containers:
    - name: api
      env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: DB_PASSWORD
```

### Config File (Mounted as Volume)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-files
data:
  config.yaml: |
    server:
      port: 3000
      timeout: 30
    database:
      host: localhost
      pool: 10
---
spec:
  containers:
    - name: api
      volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: app-config-files
```

---

## 5. Zero-Downtime Deployment Checklist

For a rolling update with zero downtime, you need **all three**:

| Requirement | How |
|-------------|-----|
| **Readiness probe** | K8s waits for new pods to be ready before killing old ones |
| **Graceful shutdown** | Old pods finish in-flight requests before exiting |
| **At least 2 replicas** | So there's always at least one pod serving traffic |

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0     # Never have fewer than desired pods
      maxSurge: 1           # Add one new before removing old
  minReadySeconds: 5        # Wait 5s after ready before counting
  template:
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: my-api:v2
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
```

### Trigger a Rolling Update

```bash
# Method 1: Update the image tag
kubectl set image deployment/api api=my-api:v2

# Method 2: Edit the manifest
kubectl edit deployment api

# Method 3: Apply new YAML
kubectl apply -f deployment-v2.yaml

# Watch the rollout
kubectl rollout status deployment/api
kubectl rollout history deployment/api

# Rollback if something goes wrong
kubectl rollout undo deployment/api
kubectl rollout undo deployment/api --to-revision=2
```

---

## 6. Using Kustomize for Environments

Kustomize lets you define a base deployment and overlay environment-specific changes without repeating YAML.

```
deploy/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
├── dev/
│   ├── kustomization.yaml
│   └── configmap-patch.yaml
└── prod/
    ├── kustomization.yaml
    └── configmap-patch.yaml
```

```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

```yaml
# prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../base
patches:
  - path: configmap-patch.yaml
replicas:
  - name: api
    count: 5
```

```bash
# Apply environment-specific config
kubectl apply -k deploy/dev/
kubectl apply -k deploy/prod/

# Preview without applying
kubectl kustomize deploy/prod/
```

---

## 7. Debugging Deployments

```bash
# Pod stuck in Pending
kubectl describe pod my-pod
# Look for: "0/3 nodes are available" — likely resource constraints
# Solution: increase node resources or reduce pod requests

# Pod in CrashLoopBackOff
kubectl logs pod-name
kubectl logs pod-name --previous    # Logs from previous crashed instance
# Solution: fix the error in the code

# Pod running but no response
kubectl port-forward pod/my-pod 8080:3000
# Then curl localhost:8080 to test directly

# Service not routing traffic
kubectl get endpoints
# Are endpoints populated? If empty, label selector doesn't match.
kubectl describe service my-svc
# Check the selector, compare with pod labels

# Image pull issues
kubectl describe pod my-pod
# ImagePullBackOff or ErrImagePull
# Check: image name, tag, registry credentials, network
```

### Debug Pod (Temporary Diagnostic Pod)

```bash
# Add a debug container to a running pod (K8s 1.27+)
kubectl debug pod/my-pod -it --image=nicolaka/netshoot

# Or run a standalone debug pod in the cluster
kubectl run debug --rm -it --image=nicolaka/netshoot -- sh
```

---

## 8. Complete Backend Deployment

```yaml
# backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  labels:
    app: backend-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: my-backend:v1   # Replace with your image
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: backend-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: backend-secrets
                  key: DB_PASSWORD
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-api
spec:
  selector:
    app: backend-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

---

**Next:** [Module 04 — Services & Networking](../04-services-networking/README.md)

**Reference:** [K8s Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) | [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) | [Kustomize](https://kustomize.io/)
