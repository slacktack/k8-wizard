# 08 — Production Hardening

> Running in dev is easy. Running in production is hard. This module covers security, reliability, cost optimization, and CI/CD — everything you need to go from "it works on my machine" to "it works in production."

## What You'll Learn

- RBAC: who can do what in the cluster
- Network policies: micro-segmentation
- Pod Security Standards (formerly PodSecurityPolicies)
- Resource quotas and limits
- Secrets management
- CI/CD pipelines for K8s
- Cost optimization

---

## 1. RBAC — Role-Based Access Control

RBAC controls who can do what in the cluster. Never give `cluster-admin` to applications or CI/CD pipelines.

### Core Concepts

```
User/ServiceAccount ──bound──► Role/ClusterRole ──grants──► Verbs on Resources
```

| Resource | Who | Example |
|----------|-----|---------|
| **User** | Human | `alice@company.com` |
| **ServiceAccount** | Machine (app, CI/CD) | `github-actions`, `prometheus` |
| **Role** | Permissions in a namespace | Can `get`, `list` pods in `default` |
| **ClusterRole** | Permissions cluster-wide | Can `get` nodes, can create PVs |
| **RoleBinding** | Binds Role to User/SA in a namespace | `alice` → `pod-reader` role in `default` |
| **ClusterRoleBinding** | Binds ClusterRole cluster-wide | `prometheus` → `cluster-monitoring` role |

### Principle of Least Privilege

```yaml
# 1. Service account for your app
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: default
---
# 2. Role with minimal permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
  - apiGroups: [""]              # Core API group
    resources: ["pods", "pods/log", "services"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list"]
---
# 3. Bind the role to the service account
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-app-binding
  namespace: default
subjects:
  - kind: ServiceAccount
    name: my-app-sa
    namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### Common ClusterRoles

```bash
# Built-in roles
kubectl get clusterroles
# view, edit, admin, cluster-admin

# Grant read-only access to a namespace
kubectl create rolebinding bob-view \
  --clusterrole=view \
  --user=bob \
  --namespace=myapp

# Grant admin access
kubectl create rolebinding bob-admin \
  --clusterrole=admin \
  --user=bob \
  --namespace=myapp
```

### ServiceAccounts in Pods

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      serviceAccountName: my-app-sa   # <── Use the SA
      automountServiceAccountToken: true  # Mounts API token (default: true)
      containers:
        - name: app
          image: my-app
```

---

## 2. Pod Security Standards

### Pod Security Admission (K8s 1.23+)

Replaces the deprecated PodSecurityPolicy. Three levels:

| Level | What it enforces | Example |
|-------|-----------------|---------|
| **Privileged** | Nothing — unrestricted | System pods, network plugins |
| **Baseline** | Minimal restrictions, known escalations prevented | Most apps |
| **Restricted** | Pod hardening best practices | PCI/HIPAA workloads |

### Enforce via Namespace Labels

```bash
# Enforce Baseline, warn about Restricted violations
kubectl label ns default \
  pod-security.kubernetes.io/enforce=baseline \
  pod-security.kubernetes.io/warn=restricted

# Enforce Restricted — your pod must pass these checks:
kubectl label ns production \
  pod-security.kubernetes.io/enforce=restricted
```

What Restricted enforces:

```yaml
# ✅ This pod passes Restricted
apiVersion: v1
kind: Pod
metadata:
  name: restricted-pod
spec:
  securityContext:
    runAsNonRoot: true            # Must not run as root
    seccompProfile:
      type: RuntimeDefault       # Use runtime's seccomp
  containers:
    - name: app
      image: my-app
      securityContext:
        allowPrivilegeEscalation: false   # Can't gain more privileges
        capabilities:
          drop: ["ALL"]                    # Drop all Linux capabilities
        readOnlyRootFilesystem: true       # Can't write to root
      resources:
        requests:
          memory: "64Mi"
          cpu: "50m"
```

---

## 3. Resource Quotas

Prevent one team/app from consuming all cluster resources.

```yaml
# resource-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "4"            # Total CPU requests across all pods
    requests.memory: "8Gi"       # Total memory requests
    limits.cpu: "8"
    limits.memory: "16Gi"
    persistentvolumeclaims: "5"  # Max PVCs
    count/secrets: "10"          # Max secrets
    count/configmaps: "10"
```

```bash
kubectl create namespace team-a
kubectl apply -f resource-quota.yaml

# Check usage
kubectl describe quota -n team-a
```

### LimitRange (Per-Container Defaults)

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: container-limits
  namespace: team-a
spec:
  limits:
    - max:
        cpu: "2"
        memory: "2Gi"
      min:
        cpu: "50m"
        memory: "32Mi"
      default:
        cpu: "200m"
        memory: "256Mi"
      defaultRequest:
        cpu: "100m"
        memory: "128Mi"
      type: Container
```

---

## 4. Secrets Management

**K8s Secrets are NOT encrypted by default** — they're base64-encoded in etcd. For real security:

### External Secrets Operator

Synchronizes secrets from external vaults (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault).

```yaml
# ExternalSecret — fetches from AWS Secrets Manager, creates a K8s Secret
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-credentials         # The K8s Secret name to create
  data:
    - secretKey: password
      remoteRef:
        key: production/db/password
```

### Sealed Secrets

Encrypts secrets at the Git level — safe to commit to repos.

```bash
# Install the controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml

# Create a sealed secret
kubectl create secret generic my-secret --dry-run=client \
  --from-literal=password=s3cret -o json \
  | kubeseal --controller-namespace=kube-system --format yaml > sealed-secret.yaml

# This YAML is safe to commit to Git!
kubectl apply -f sealed-secret.yaml
```

### Vault (HashiCorp)

The gold standard. Dynamic secrets (short-lived), audit logs, encryption as a service.

```yaml
# Inject Vault secrets as a sidecar
annotations:
  vault.hashicorp.com/agent-inject: "true"
  vault.hashicorp.com/role: "myapp"
  vault.hashicorp.com/agent-inject-secret-db: "database/creds/myapp"
```

---

## 5. Network Policies — Micro-Segmentation

```yaml
# deny-all.yaml — Default deny (outstanding best practice)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}           # Applies to all pods in the namespace
  policyTypes:
    - Ingress
    - Egress
```

```yaml
# allow-frontend.yaml — Only frontend can talk to API
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - port: 5432
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0    # Allow internet for external API calls
```

---

## 6. Node/Pod Anti-Affinity

Spread pods across nodes for high availability.

```yaml
spec:
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchLabels:
                app: api
            topologyKey: kubernetes.io/hostname   # Spread across nodes
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:   # Hard requirement
        - labelSelector:
            matchLabels:
              app: api
          topologyKey: kubernetes.io/hostname
```

### PodDisruptionBudget (PDB)

Ensure minimum availability during voluntary disruptions (node drains, updates).

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
spec:
  minAvailable: 2           # Or maxUnavailable: 1
  selector:
    matchLabels:
      app: api
```

---

## 7. CI/CD for Kubernetes

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yaml
name: Deploy to K8s
on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Update deployment YAML
        run: |
          sed -i "s|image: .*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}|" k8s/deployment.yaml

      - name: Deploy to K8s
        uses: actions-hub/kubectl@master
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
        with:
          args: apply -f k8s/
```

### GitOps with ArgoCD

The modern standard: Git is the single source of truth. ArgoCD syncs cluster state to match Git.

```yaml
# argocd-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
spec:
  destination:
    namespace: production
    server: https://kubernetes.default.svc
  project: default
  source:
    repoURL: https://github.com/myorg/my-app-config
    targetRevision: main
    path: k8s/production
  syncPolicy:
    automated:
      prune: true              # Remove resources not in Git
      selfHeal: true           # Revert manual changes
```

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Access UI
kubectl port-forward -n argocd svc/argocd-server 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

---

## 8. Cost Optimization

### Right-Sizing

```bash
# Find pods with wasted resources
kubectl top pods -n myapp
```

| Signal | Action |
|--------|--------|
| CPU request > actual usage | Lower CPU request |
| Memory request > actual usage x 1.5 | Lower memory request |
| Pod using < 10% of CPU limit | Lower limit or use less replicas |
| No resource limits set | Add them (pods can DoS the node) |

### Spot Instances (80-90% cheaper)

```bash
# EKS — specify spot in nodegroup
eksctl create nodegroup --spot --instance-types=m5.large,m5.xlarge,m5.2xlarge
```

### Cluster Sizing

| Rule | Reason |
|------|--------|
| Don't run empty nodes | Cluster Autoscaler will downscale |
| Bin pack pods | Higher utilization = fewer nodes = lower cost |
| Use node selectors/taints | Separate batch (cheap spot) from critical (on-demand) |
| Delete unused volumes | Orphaned PVCs still cost money |

---

## 9. Production Checklist

### Before Going Live

- [ ] **Resource limits** set on all containers
- [ ] **Readiness + liveness probes** configured
- [ ] **PodDisruptionBudget** set for critical services
- [ ] **RBAC** — no service accounts with cluster-admin
- [ ] **Network policies** — default deny applied
- [ ] **Pod Security Standards** — at least baseline enforced
- [ ] **Resource quotas** — limit blast radius per namespace
- [ ] **Secrets** — using External Secrets or Sealed Secrets
- [ ] **Backup** — Velero or equivalent configured
- [ ] **Monitoring** — Prometheus + Grafana + alerts
- [ ] **Logging** — centralized log aggregation
- [ ] **Rollback plan** — tested `kubectl rollout undo`
- [ ] **CI/CD** — automated builds and deployments
- [ ] **Anti-affinity** — pods spread across nodes
- [ ] **Node autoscaling** — Cluster Autoscaler configured

---

**Reference:** [K8s Security](https://kubernetes.io/docs/concepts/security/) | [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | [ArgoCD](https://argo-cd.readthedocs.io/) | [External Secrets](https://external-secrets.io/)
