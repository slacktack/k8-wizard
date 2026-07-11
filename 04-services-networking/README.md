# 04 — Services & Networking

> Once you have multiple services in your cluster, they need to find and talk to each other. This module covers all the networking layers — from internal DNS to external ingress with TLS.

## What You'll Learn

- How K8s DNS works (CoreDNS)
- Service types in depth
- Headless services for direct pod access
- Ingress controllers for HTTP/HTTPS routing
- The new Gateway API (modern alternative to Ingress)
- Network policies for traffic control

---

## 1. The Kubernetes Networking Model

**Every pod gets its own IP address.** All pods can talk to all other pods without NAT. This is the fundamental contract.

```
Pod A: 10.244.1.5  ───────►  Pod B: 10.244.2.8    ✓ Direct
Pod A: 10.244.1.5  ───────►  Internet               ✓ Via egress
Internet ───────►  Pod A: 10.244.1.5               ✗ Not by default
```

---

## 2. Service Types — In Depth

### ClusterIP (Default)

Internal virtual IP. Load-balances across pods. Only reachable from inside the cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
    - port: 6379           # Service port
      targetPort: 6379     # Pod port
  type: ClusterIP          # Default — can omit
```

**Access from another pod:** `redis:6379` or `redis.default.svc.cluster.local:6379`

### NodePort

Exposes the service on **every node's IP** at a static port (30000-32767).

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 30080      # Optional — K8s assigns one if omitted
```

**Access:** `http://<any-node-ip>:30080`

Great for local Kind clusters because you can map the node port to your host port with `extraPortMappings` in the Kind config.

### LoadBalancer

Creates an external load balancer (cloud LB on AWS/GCP/Azure, MetalLB on-prem). In Kind, the external IP stays `<pending>` unless you use `metallb` or port-forward.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 3000
```

**In Kind:** `kubectl port-forward svc/web 8080:80` is the workaround.

### ExternalName

DNS alias for an external service. No proxying — just a CNAME record.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: my-database.example.com
```

**Access from pod:** `external-db.default.svc.cluster.local` → resolves to `my-database.example.com`

---

## 3. Headless Services

When you don't want load-balancing and need direct pod IPs (for stateful apps, service mesh, discovery).

```yaml
apiVersion: v1
kind: Service
metadata:
  name: stateful-db
spec:
  clusterIP: None             # <── makes it headless
  selector:
    app: stateful-db
  ports:
    - port: 5432
```

**DNS resolves to all pod IPs:**
```bash
# Regular service: resolves to the virtual IP
nslookup redis          # → 10.96.0.1 (virtual IP)

# Headless service: resolves to all pod IPs
nslookup stateful-db    # → 10.244.1.5, 10.244.2.8, 10.244.3.2 (direct pod IPs)
```

---

## 4. CoreDNS — How Service Discovery Works

Kubernetes runs CoreDNS as a cluster DNS service. Every service gets a DNS name.

```
<service>.<namespace>.svc.cluster.local
     │          │            │
   redis      default       cluster domain (usually cluster.local)
```

```bash
# From inside any pod:
curl http://backend-api.default.svc.cluster.local:3000
# Or just:
curl http://backend-api:3000          # Within the same namespace
curl http://backend-api.other-ns:3000 # Cross-namespace
```

**Check DNS:**
```bash
kubectl run dns-test --rm -it --image=busybox:1.28 -- nslookup kubernetes.default
kubectl get pods -n kube-system -l k8s-app=kube-dns    # CoreDNS pods
```

---

## 5. Ingress Controller — HTTP Routing

A Service gives you one IP. Ingress gives you **smart routing** for HTTP/HTTPS.

```
                    ┌──────────────┐
User ──► http://api.example.com ──►│  Ingress      │
                    │  Controller  │
                    │              │
                    │  /api/* ───► │──► backend-api:80
                    │  /app/* ───► │──► frontend:80
                    │  /admin ───► │──► admin-dashboard:80
                    └──────────────┘
```

### Install an Ingress Controller (kind requires this step)

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for it to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

### Define an Ingress Resource

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /   # URL rewriting
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx                # Which controller to use
  rules:
    - host: app.localhost                 # Virtual host routing
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-api
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

### Test in Kind

```yaml
# kind-config.yaml with port mapping for ingress
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
```

```bash
kind create cluster --name learn --config kind-config.yaml
curl http://localhost/api/health
curl http://localhost/
```

---

## 6. TLS with Ingress

```yaml
# tls-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: tls-secret                    # TLS cert as a Secret
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 443
```

### Self-Signed Cert for Testing

```bash
# Generate a self-signed cert
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=app.localhost/O=app.localhost"

# Create the TLS secret
kubectl create secret tls tls-secret \
  --key tls.key --cert tls.crt
```

### cert-manager for Real TLS

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

# It auto-provisions LetsEncrypt certificates with the ClusterIssuer resource
```

---

## 7. Gateway API (The Modern Successor)

The Ingress API has limitations (vendor-specific annotations, only HTTP, path-based routing only). The **Gateway API** is the next-generation replacement with role-based personas and protocol flexibility.

```yaml
# gateway-api.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: my-gateway
spec:
  gatewayClassName: istio                     # Or: nginx, contour, etc.
  listeners:
    - name: http
      protocol: HTTP
      port: 80
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-route
spec:
  parentRefs:
    - name: my-gateway
  hostnames:
    - api.example.com
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api
      backendRefs:
        - name: backend-api
          port: 80
```

**Why Gateway API over Ingress:**
- More expressive routing (weighted, header-based, query-param)
- Role separation (infra team owns Gateway, app team owns Routes)
- Works with HTTP, gRPC, TCP, UDP — not just HTTP
- Standardized across all vendors (no vendor-specific annotations)

---

## 8. Network Policies

By default, all pods can talk to all pods. **Network policies restrict traffic** between pods.

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-policy
spec:
  podSelector:
    matchLabels:
      app: api                          # Apply to these pods
  policyTypes:
    - Ingress                           # Incoming traffic rules
    - Egress                            # Outgoing traffic rules
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend             # Only allow traffic from frontend
        - namespaceSelector:
            matchLabels:
              name: monitoring          # Allow from monitoring namespace
      ports:
        - port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database             # Only allow traffic to database
      ports:
        - port: 5432
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0            # Allow internet access (for API calls)
          except:
            - 10.0.0.0/8               # But block private ranges
```

### Prerequisites

Network policies require a **CNI plugin** that supports them. Kind's default CNI doesn't — install Calico:

```bash
kubectl apply -f https://docs.tigera.io/calico/latest/manifests/calico.yaml
```

---

## 9. The Full Flow: User to Pod

```
User's browser
     │
     ▼  DNS resolves api.example.com to your LoadBalancer/external IP
Internet / Cloud LB
     │
     ▼  Ingress Controller pod receives the request
Ingress Controller (nginx/istio/traefik)
     │  Parses host/routing rules
     │  Terminates TLS if configured
     ▼
Service (ClusterIP)
     │  Load-balances across ready pods
     │  Uses iptables/ipvs to redirect
     ▼
Pod (container)
     │  Your application code runs here
     │  Can talk to other pods via DNS
     ▼
Database, Cache, External APIs
```

---

**Next:** [Module 05 — Scaling](../05-scaling/README.md)

**Reference:** [K8s Services](https://kubernetes.io/docs/concepts/services-networking/service/) | [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) | [Gateway API](https://gateway-api.sigs.k8s.io/) | [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
