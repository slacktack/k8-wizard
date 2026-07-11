# K8 Wizard — Learn Kubernetes & Docker from Scratch

> A comprehensive, hands-on curriculum that takes you from zero to production-grade Kubernetes.
> Everything runs locally on your machine using Kind (Kubernetes in Docker) — no cloud bill.

## The K8 Wizard Web UI

This repo ships with a **React + Vite web application** (`web-learn/`) that wraps the entire curriculum in an interactive terminal playground with light/dark modes, lesson progress tracking, Cmd+K search across 70 lessons, and a live K8 simulation playground.

```bash
cd web-learn
npm install
npm run dev
```

The web UI is deployed at [k8-wizard.vercel.app](https://k8-wizard.vercel.app) (or your own deployment).

## Curriculum

| Module | What You'll Learn | Difficulty |
|--------|-------------------|------------|
| **01** — [Docker Basics](./01-docker-basics/README.md) | Images, containers, Dockerfiles, volumes, networking, multi-stage builds, Compose | Beginner |
| **02** — [Kubernetes Basics](./02-kubernetes-basics/README.md) | Kind clusters, Pods, Deployments, Services, ConfigMaps, Secrets, kubectl | Beginner |
| **03** — [Deploying Backends](./03-deploying-backends/README.md) | Deployment strategies, health probes, graceful shutdown, env injection, Kustomize | Intermediate |
| **04** — [Services & Networking](./04-services-networking/README.md) | CoreDNS, Service types, Ingress, Gateway API, Network Policies | Intermediate |
| **05** — [Scaling](./05-scaling/README.md) | HPA, VPA, Cluster Autoscaler, custom metrics, load testing | Intermediate+ |
| **06** — [Storage & Stateful Workloads](./06-storage/README.md) | PVCs, PVs, StorageClasses, StatefulSets, PostgreSQL on K8s | Intermediate+ |
| **07** — [Monitoring & Observability](./07-monitoring/README.md) | Prometheus, Grafana, Loki, OpenTelemetry, alerting, RED/USE methods | Advanced |
| **08** — [Production Hardening](./08-production/README.md) | RBAC, Pod Security, quotas, secrets management, ArgoCD, cost optimization | Advanced+ |

**58 lessons total** across 8 phases, tagged by difficulty (beginner / intermediate / advanced / expert).

## Prerequisites

- macOS, Linux, or Windows (WSL2)
- Basic terminal knowledge
- ~10 GB free disk space for images and clusters

## Quick Install

```bash
# Docker Desktop
#   macOS: brew install --cask docker
#   Linux: curl -fsSL https://get.docker.com | sh

# Kind (Kubernetes in Docker)
brew install kind

# kubectl
brew install kubectl

# Verify
docker --version && kind version && kubectl version --client
```

## Architecture

```
  +------------------+          +--------------------+
  |   Docker CLI     |          |     kubectl        |
  +--------+---------+          +---------+----------+
           |                              |
           v                              v
  +--------------------------------------------+
  |           Docker Daemon (dockerd)           |
  |                                              |
  |  +--------+ +--------+ +-----------------+  |
  |  | ctr 1  | | ctr 2  | |  Kind Node      |  |
  |  +--------+ +--------+ |  (Docker ctr)    |  |
  |                         |  +-----------+  |  |
  |                         |  | kubelet   |  |  |
  |                         |  | kube-apiserver | |
  |                         |  | etcd      |  |  |
  |                         |  | Pods      |  |  |
  |                         |  +-----------+  |  |
  |                         +-----------------+  |
  +----------------------------------------------+
```

Kind creates Kubernetes clusters where every node (control-plane + workers) runs as a Docker container with `kubelet`, `kube-apiserver`, `etcd`, and `containerd` inside.

## How to Use This

```
1. Clone the repo      git clone https://github.com/slacktack/k8-wizard
2. Start at Module 01  cd K8-docker-learn/01-docker-basics
3. Follow each lesson  README.md + example files + commands to run
4. Practice online     Each lesson links to Killercoda for free real-cluster practice
```

## Projects You'll Build

- A Go/Node.js backend API containerized and deployed on K8s
- A frontend app communicating via K8s DNS
- PostgreSQL running as a StatefulSet with persistent storage
- Auto-scaling demo that responds to load spikes
- Full monitoring stack with Prometheus, Grafana, and alerts

## Learning Philosophy

- **Learn by doing** — every concept has a `kubectl apply` or `docker run` command
- **Everything local** — no cloud account or credit card required
- **Break things on purpose** — the best way to understand recovery is to cause failures
- **Read the YAML** — every manifest is annotated to explain each field

## License

MIT — free to use, share, and remix.

---

**Start here:** [Module 01 — Docker Basics](./01-docker-basics/README.md)
 — no cloud account or credit card required
- **Break things on purpose** — the best way to understand recovery is to cause failures
- **Read the YAML** — every manifest is annotated to explain each field

## License

MIT — free to use, share, and remix.

---

**Start here:** [Module 01 — Docker Basics](./01-docker-basics/README.md)
