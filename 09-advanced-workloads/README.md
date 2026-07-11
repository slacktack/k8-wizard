# 09 — Advanced Workloads & Scheduling

> Beyond Deployments and StatefulSets. This module covers DaemonSets, Jobs/CronJobs, Taints and Tolerations, Topology Spread Constraints, Priority Classes, and the specialized container types (init, sidecar, ephemeral).

## Lessons

1. **DaemonSets** — Run a pod on every node (cluster agents, CNI, log collectors)
2. **Jobs & CronJobs** — Batch processing, scheduled tasks, backups
3. **Taints & Tolerations** — Node specialization, dedicated/spot nodes
4. **Topology Spread Constraints** — High availability across zones and nodes
5. **Priority Classes & Preemption** — Critical vs. best-effort workloads
6. **Init, Sidecar & Ephemeral Containers** — Setup tasks, auxiliary services, debugging

## Prerequisites

- A Kind cluster from [Module 02](../02-kubernetes-basics/README.md)
- kubectl configured

**Next:** [Module 10 — Extending Kubernetes & Production Patterns](../10-extending-k8s/README.md)
