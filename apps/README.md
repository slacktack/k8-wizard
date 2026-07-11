# Example Apps

This directory contains sample applications you can build, containerize, and deploy to your Kind cluster.

## Apps

| App | Language | Description | Port |
|-----|----------|-------------|------|
| `simple-api/` | Node.js/Express | REST API with health checks, graceful shutdown, CPU stress endpoint | 3000 |
| `go-api/` | Go | Same API in Go — multi-stage build, ~15MB image | 3000 |
| `frontend/` | Node.js | Simple web UI that calls the backend API | 8080 |

## Quick Start

```bash
# 1. Build the images
docker build -t simple-api:v1 apps/simple-api
docker build -t frontend:v1 apps/frontend

# 2. Load into Kind
kind load docker-image simple-api:v1 --name learn
kind load docker-image frontend:v1 --name learn

# 3. Deploy
kubectl apply -f apps/simple-api/k8s/
kubectl apply -f apps/frontend/k8s/

# 4. Access
kubectl port-forward -n demo svc/frontend 8080:80
# Open http://localhost:8080
```

## Full Stack Demo

When you're ready, deploy everything:
- `simple-api` (backend)
- `frontend` (web UI that calls backend)
- PostgreSQL StatefulSet (from module 06)

```bash
kubectl apply -f apps/simple-api/k8s/
kubectl apply -f apps/frontend/k8s/
kubectl apply -f 06-storage/postgres-statefulset.yaml
```

See [DEPLOY.md](./DEPLOY.md) for specific commands.
