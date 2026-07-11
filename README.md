# Kubernetes + Docker — Learn from Scratch

> A comprehensive, hands-on guide to containerization and Kubernetes orchestration.
> Everything here is designed to be run locally on your machine — no cloud bill required.

## Prerequisites

- macOS, Linux, or Windows (WSL2)
- Basic terminal knowledge (`cd`, `ls`, `cat`, etc.)
- ~10GB free disk space for images and clusters

## Curriculum

| Module | What You'll Learn |
|--------|-------------------|
| **01** — [Docker Basics](./01-docker-basics/README.md) | Images, containers, Dockerfiles, volumes, networking, multi-stage builds |
| **02** — [Kubernetes Basics + Kind](./02-kubernetes-basics/README.md) | Pods, Deployments, Services, ConfigMaps, Secrets, **what Kind is and why it exists** |
| **03** — [Deploying Backends](./03-deploying-backends/README.md) | Stateless backends, environment injection, rolling updates, health checks |
| **04** — [Services & Networking](./04-services-networking/README.md) | Service types, DNS, Ingress, Gateway API, mTLS basics |
| **05** — [Scaling](./05-scaling/README.md) | Horizontal Pod Autoscaler, Vertical Pod Autoscaler, Cluster Autoscaler, load testing |
| **06** — [Storage & Stateful Workloads](./06-storage/README.md) | Volumes, PersistentVolumeClaims, StatefulSets, Databases on K8s |
| **07** — [Monitoring & Observability](./07-monitoring/README.md) | Metrics, logging, tracing, Prometheus, Grafana, Loki |
| **08** — [Production Hardening](./08-production/README.md) | RBAC, network policies, resource limits, pod security, CI/CD |

## How to Use This

```bash
# 1. Clone the repo
git clone <this-repo>
cd K8-docker-learn

# 2. Start at module 01 and work through in order
# 3. Each module has README.md + example files
# 4. Commands in code blocks are ready to copy-paste

# Everything runs on your machine with:
#   Docker Desktop  — for containers
#   kind            — for Kubernetes clusters
#   kubectl         — for cluster management
```

## What is Kind?

**Kind** = **K**ubernetes **in** **D**ocker.

It creates lightweight Kubernetes clusters by running each cluster node as a Docker container. This is the standard tool for:

- Learning Kubernetes locally (no cloud credits needed)
- Local development & testing
- CI/CD pipelines (it spins up in seconds)

You'll install and use Kind in [Module 02](./02-kubernetes-basics/README.md).

## Learning Philosophy

1. **Learn by doing** — every concept has a `kubectl apply` or `docker run` command
2. **Run everything locally** — no cloud account, no credit card
3. **Break things on purpose** — the best way to understand recovery is to cause failures
4. **Read the YAML** — every manifest is annotated so you understand what each field does

## Quick Install Guide

```bash
# Docker Desktop (includes Docker CLI)
#   macOS: brew install --cask docker
#   Linux: curl -fsSL https://get.docker.com | sh
#   Windows: install Docker Desktop from docker.com

# Kind
brew install kind            # macOS
# or: curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64

# kubectl
brew install kubectl         # macOS
# or: curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Verify everything
docker --version
kind version
kubectl version --client
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Your Machine                         │
│                                                          │
│  ┌──────────────┐    ┌───────────────────────────────┐  │
│  │  Docker CLI   │    │         kubectl                │  │
│  └──────┬───────┘    └──────────┬────────────────────┘  │
│         │                       │                        │
│         ▼                       ▼                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Docker Daemon (dockerd)              │   │
│  │                                                   │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐  ┌─────────────────┐   │   │
│  │  │ctr 1│ │ctr 2│ │ctr 3│  │ Kind Node (ctr) │   │   │
│  │  └─────┘ └─────┘ └─────┘  │  ┌───────────┐  │   │   │
│  │                            │  │ kubelet   │  │   │   │
│  │                            │  │ kube-apiserver │  │   │
│  │                            │  │ kube-scheduler │  │   │
│  │                            │  │ etcd      │  │   │   │
│  │                            │  │ Pod 1 │ Pod 2│  │   │   │
│  │                            │  └───────────┘  │   │   │
│  │                            └─────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Projects You'll Build

- ✅ **A Go/Node.js backend API** containerized and deployed
- ✅ **A frontend app** that talks to the backend via K8s DNS
- ✅ **A database (PostgreSQL)** running as a StatefulSet with persistent storage
- ✅ **Auto-scaling demo** that handles load spikes
- ✅ **Monitoring stack** with dashboards and alerts

---

**Next:** Start with [Module 01 — Docker Basics](./01-docker-basics/README.md)
