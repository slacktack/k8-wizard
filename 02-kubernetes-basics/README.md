# 02 — Kubernetes Basics + Kind

> Kubernetes (K8s) is a platform for running containerized applications across a cluster of machines. It handles deployment, scaling, networking, and health — so you don't have to SSH into servers and restart processes.

## What You'll Learn

- What Kubernetes is and the problem it solves
- **What Kind is and how it works under the hood**
- Pods, Deployments, Services, ConfigMaps, Secrets, Namespaces
- `kubectl` — the CLI that controls your cluster
- Your first app on Kubernetes

---

## 1. The Problem Kubernetes Solves

**Without Kubernetes**, running containers in production means:

- Manually SSH-ing into servers to restart crashed containers
- Figuring out which server has free capacity
- Copy-pasting environment variables everywhere
- Zero-downtime deploys = bash scripts you don't trust
- One server goes down = your app goes down

**With Kubernetes**, you declare what you want:

> "Run 3 replicas of my-api on port 3000, with 256MB RAM each, expose it on a stable IP, and if one crashes, create a replacement."

Kubernetes makes that happen. It's an **operating system for your cluster**.

---

## 2. What is Kind?

**Kind** = **K**ubernetes **in** **D**ocker.

### What it does

Kind creates a Kubernetes cluster where every node (control-plane, worker) is a Docker container. Each container runs a full Linux environment with `kubelet`, `kube-apiserver`, `etcd`, `kube-scheduler`, `kube-controller-manager`, and `containerd` inside it.

### Why does Kind exist?

| Problem | Kind's Solution |
|---------|----------------|
| Production clusters need multiple VMs/machines | Kind runs on a single machine using Docker |
| Cloud clusters (EKS, AKS, GKE) cost money | Kind is **free** — runs locally |
| Setting up a real cluster takes hours | Kind creates a cluster in **~60 seconds** |
| CI/CD needs ephemeral clusters | Kind starts/stops instantly in CI pipelines |
| `minikube` needs a VM (VirtualBox/hypervisor) | Kind uses Docker containers — no VM overhead |

### Kind vs Other Options

| Tool | Architecture | Boot Time | Best For |
|------|-------------|-----------|----------|
| **Kind** | Nodes as Docker containers | 30-60s | CI/CD, local dev, learning |
| **Minikube** | Single node in a VM | 2-5min | Local dev with VM isolation |
| **k3d** | Nodes as Docker containers (uses K3s) | 20-40s | Lightweight, ARM, Raspberry Pi |
| **MicroK8s** | Snap package on Linux | 10-20s | Ubuntu Linux, IoT |
| **kubeadm** | Real cluster setup | 15-30min | Production, on-prem |

### How Kind Works (The Architecture)

```
┌─────────────────────────────────────────────────────┐
│                  Docker Daemon                        │
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │     Kind Node: control-plane (container)     │     │
│  │                                              │     │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │     │
│  │  │ kube-    │ │ kube-    │ │  etcd        │  │     │
│  │  │ apiserver│ │ scheduler│ │  (cluster DB)│  │     │
│  │  └──────────┘ └──────────┘ └─────────────┘  │     │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │     │
│  │  │ kube-    │ │ kubelet  │ │  containerd  │  │     │
│  │  │ controller│ │          │ │  (container  │  │     │
│  │  │ -manager  │ │          │ │   runtime)   │  │     │
│  │  └──────────┘ └──────────┘ └─────────────┘  │     │
│  └─────────────────────────────────────────────┘     │
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │     Kind Node: worker (container)            │     │
│  │                                              │     │
│  │  ┌──────────┐ ┌──────────┐                   │     │
│  │  │ kubelet   │ │containerd│                   │     │
│  │  └──────────┘ └──────────┘                   │     │
│  │  ┌──────────────────────────────────┐        │     │
│  │  │  Pods running your apps          │        │     │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐     │        │     │
│  │  │  │app:v1│ │app:v1│ │app:v1│     │        │     │
│  │  │  └──────┘ └──────┘ └──────┘     │        │     │
│  │  └──────────────────────────────────┘        │     │
│  └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

Kind uses `containerd` (not Docker directly) as the container runtime inside each node. The Docker containers Kind creates are just the "VM-like" boundary — K8s manages its own containers inside them.

---

## 3. Install & Create a Cluster

```bash
# Install kind
brew install kind          # macOS
# or: curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64 && chmod +x ./kind

# Create a cluster
kind create cluster --name learn

# Verify
kind get clusters
kubectl cluster-info
kubectl get nodes
```

### Multi-Node Cluster (For learning scaling later)

```yaml
# kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
  - role: worker
```

```bash
kind create cluster --name learn --config kind-config.yaml
kubectl get nodes
# NAME                     STATUS   ROLES           AGE
# learn-control-plane     Ready    control-plane   1m
# learn-worker           Ready    <none>          1m
# learn-worker2          Ready    <none>          1m
# learn-worker3          Ready    <none>          1m
```

### Delete and recreate

```bash
kind delete cluster --name learn
kind create cluster --name learn
```

---

## 4. Core Concepts

### Pod

The smallest deployable unit in Kubernetes. A pod encapsulates one or more containers with shared storage/network.

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: my-app
spec:
  containers:
    - name: my-container
      image: nginx:alpine
      ports:
        - containerPort: 80
```

```bash
kubectl apply -f pod.yaml
kubectl get pods
kubectl describe pod my-pod
kubectl delete pod my-pod
```

> **Important:** You almost never create Pods directly. You create **Deployments** (or other controllers) that manage Pods for you. Pods are mortal — they can die and be replaced.

### Deployment

A Deployment manages a **ReplicaSet** of Pods. It handles:
- Desired number of replicas
- Rolling updates with zero downtime
- Rollbacks
- Self-healing (restart on crash)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 3                        # Run 3 identical pods
  selector:
    matchLabels:
      app: my-app                     # Which pods belong to this deployment
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: nginx:alpine
          ports:
            - containerPort: 80
          resources:
            requests:                # Minimum guaranteed resources
              memory: "64Mi"
              cpu: "100m"            # 0.1 CPU core
            limits:                  # Maximum allowed resources
              memory: "128Mi"
              cpu: "200m"
```

```bash
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl get pods              # See the 3 pods the deployment created
kubectl get replicasets       # The ReplicaSet managing those pods
```

### Service

Pods are ephemeral — they get new IPs when they restart. A **Service** provides a stable endpoint (IP + DNS name) that load-balances across the pods.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app                 # Routes traffic to pods with this label
  ports:
    - port: 80                  # Service port
      targetPort: 80            # Pod container port
  type: ClusterIP               # Default — internal-only IP
```

```bash
kubectl apply -f service.yaml
kubectl get services
# NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
# my-service   ClusterIP   10.96.123.45    <none>        80/TCP

# Access it from another pod
kubectl run test --rm -it --image=busybox -- wget -qO- http://my-service
```

### Service Types

| Type | Accessible From | Use Case |
|------|----------------|----------|
| `ClusterIP` | Inside the cluster only | Internal APIs, databases |
| `NodePort` | `<node-ip>:<port>` | Dev/testing, direct access |
| `LoadBalancer` | Public IP (cloud LB) | Production internet-facing services |
| `ExternalName` | DNS alias | Pointing to external services |

### Namespace

Logical isolation boundary within a cluster. Like a virtual cluster inside your cluster.

```bash
kubectl get namespaces
# default       — where resources go by default
# kube-system   — K8s system components
# kube-public   — publicly readable resources
# kube-node-lease — node heartbeat data

kubectl create namespace my-app
kubectl get pods -n my-app      # List pods in a namespace
kubectl config set-context --current --namespace=my-app  # Set default ns
```

---

## 5. Configuration & Secrets

### ConfigMap

Inject configuration as environment variables or files.

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: production
  API_URL: https://api.example.com
  app.properties: |
    log.level=info
    cache.ttl=300
```

```yaml
# Use in a Deployment
envFrom:
  - configMapRef:
      name: app-config
```

### Secret

Like ConfigMap but values are base64-encoded. **NOT secure by itself** — use with encryption at rest and RBAC.

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: cG9zdGdyZXM=      # echo -n 'postgres' | base64
  password: cGFzc3dvcmQxMjM=  # echo -n 'password123' | base64
```

```yaml
# Use in a Deployment
env:
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: username
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: password
```

> **⚠️ For real secrets:** Use `sops`, `sealed-secrets`, or `external-secrets` (Vault, AWS Secrets Manager). Don't commit raw secrets to git.

---

## 6. Your First App on Kubernetes

Let's deploy a real app end-to-end.

```yaml
# deploy-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-world
  template:
    metadata:
      labels:
        app: hello-world
    spec:
      containers:
        - name: app
          image: hashicorp/http-echo:latest
          args:
            - "-text=Hello, Kubernetes!"
          ports:
            - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: hello-world
spec:
  selector:
    app: hello-world
  ports:
    - port: 80
      targetPort: 5678
  type: ClusterIP
```

```bash
# Deploy it
kubectl apply -f deploy-app.yaml

# See what we created
kubectl get deployments
kubectl get pods
kubectl get services

# Test it (run a temporary pod in the cluster)
kubectl run curl --rm -it --image=curlimages/curl -- sh
curl http://hello-world
# Hello, Kubernetes!
exit

# Scale it
kubectl scale deployment hello-world --replicas=5
kubectl get pods -w    # Watch new pods being created

# Port-forward to access locally
kubectl port-forward service/hello-world 8080:80
curl http://localhost:8080
# Hello, Kubernetes!
```

---

## 7. kubectl — The K8s CLI

```bash
# Apply/Delete manifests
kubectl apply -f file.yaml
kubectl delete -f file.yaml

# Get resources
kubectl get pods                             # Basic
kubectl get pods -o wide                     # With node/IP info
kubectl get pods -o yaml                     # Full YAML spec
kubectl get pods --watch                     # Watch for changes

# Describe (detailed info, events)
kubectl describe pod my-pod
kubectl describe node worker

# Logs
kubectl logs pod-name
kubectl logs deployment/my-deployment        # Show one pod from deployment
kubectl logs -l app=my-app                   # All pods with label

# Exec into a pod
kubectl exec -it pod-name -- sh

# Port forwarding
kubectl port-forward pod/my-pod 8080:80
kubectl port-forward service/my-svc 8080:80

# Debug
kubectl get events --sort-by='.lastTimestamp'
kubectl top pods
kubectl top nodes

# Shortcuts
kubectl get po       # pods
kubectl get deploy   # deployments
kubectl get svc      # services
kubectl get cm       # configmaps
kubectl get secrets
kubectl get ns       # namespaces
kubectl get no       # nodes
kubectl get all      # everything in current namespace
```

---

## 8. Resource Requests & Limits

One of the most important concepts. This is how you tell K8s:

- **Requests**: "I need at least this much to run properly" (scheduling guarantee)
- **Limits**: "Don't let the pod use more than this" (throttle/OOM prevent)

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"          # 1/4 of a CPU core
  limits:
    memory: "512Mi"
    cpu: "500m"          # 1/2 of a CPU core
```

**What happens if you don't set these:**

- A pod can consume all node resources, starving others
- The scheduler doesn't know how much room you need
- `kubectl top` shows 0 for pods without requests set

```bash
# See resource usage
kubectl top pods
kubectl top nodes
```

---

## 9. Hands-On: First App

```bash
# 1. Create a cluster
kind create cluster --name learn

# 2. Save this YAML as first-app.yaml
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
      - name: app
        image: hashicorp/http-echo:latest
        args: ["-text=Hello, K8s!"]
        ports:
        - containerPort: 5678
        resources:
          requests:
            memory: "32Mi"
            cpu: "50m"
          limits:
            memory: "64Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: hello
spec:
  selector:
    app: hello
  ports:
    - port: 80
      targetPort: 5678
EOF

# 3. Watch it come alive
kubectl get pods -w     # Press Ctrl+C when all 3 are Running

# 4. Access it
kubectl port-forward svc/hello 9999:80 &
curl http://localhost:9999
# Hello, K8s!

# 5. Break a pod — watch it self-heal
kubectl delete pod hello-xxxxx  # one of the pod names from step 3
kubectl get pods -w              # K8s immediately creates a replacement

# 6. Clean up
kind delete cluster --name learn
```

---

## Quick Reference: Pod Lifecycle

```
Pending ──► ContainerCreating ──► Running ──► Succeeded
                                      │
                                      ▼
                                   Failed / CrashLoopBackOff
                                      │
                                      ▼ (restarted by deployment)
                                   Running
```

When a pod enters `CrashLoopBackOff`, K8s keeps restarting with exponential backoff. Use `kubectl describe pod` and `kubectl logs` to debug.

---

**Next:** [Module 03 — Deploying Backends](../03-deploying-backends/README.md)

**Reference:** [Kubernetes docs](https://kubernetes.io/docs/concepts/) | [Kind docs](https://kind.sigs.k8s.io/) | [kubectl cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
