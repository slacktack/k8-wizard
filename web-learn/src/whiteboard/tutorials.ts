import type { Element } from './types';

/* ============================================================
   Guided Tutorials — step-by-step system design walkthroughs
   that auto-populate the canvas with components and connections.
   Each tutorial focuses on a real architecture pattern with
   deep trade-off analysis and production considerations.
   ============================================================ */

export interface TutorialStep {
  title: string;
  description: string;
  elements: Element[];
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  steps: TutorialStep[];
}

let idCounter = 0;
function uid(): string {
  idCounter += 1;
  return `t_${Date.now().toString(36)}_${idCounter}`;
}

const B = '#3553ff';
const C = '#00d4aa';
const G = '#3fb950';
const O = '#d29922';
const M = '#c678dd';

// ============================================================
// Tutorial 1: 3-Tier Web App — the classic production architecture
// ============================================================
const THREE_TIER: Tutorial = {
  id: 'three-tier',
  name: '3-Tier Web Application — Deep Dive',
  description: 'Master the classic three-tier architecture: Browser → API → Database. Covers caching, connection pooling, read replicas, and the stateless scaling pattern used by virtually every production web app.',
  difficulty: 'beginner',
  steps: [
    {
      title: 'Why Three Tiers?',
      description: 'The three-tier architecture separates concerns into presentation, application, and data layers. This lets each tier scale independently — add more API servers without touching the database, or scale read replicas without affecting writes. The trade-off: higher latency per request (one hop per tier) and more operational complexity. For most web applications, this is the right starting point — predictable, debuggable, and maps cleanly onto Kubernetes primitives. The presentation tier handles HTTP termination and asset serving. The application tier runs business logic as stateless processes. The data tier provides durable storage with caching for read performance.',
      elements: [],
    },
    {
      title: 'Presentation Tier — Client & Edge',
      description: 'The Browser represents your users. At the edge, a CDN caches static assets close to users geographically — CloudFront, Cloudflare, or Fastly reduce latency from ~200ms to ~10ms. Below the CDN, a Load Balancer distributes HTTP traffic across frontend instances. In Kubernetes: Ingress controller (NGINX/ALB) terminates TLS and routes to a ClusterIP Service. Key consideration: CDN caching works best for immutable assets with long Cache-Control headers. For dynamic API responses, consider a reverse proxy cache like Varnish or use CDN shielding. Never cache sensitive data at the edge.',
      elements: [
        { id: uid(), type: 'rectangle', x: 320, y: 20, width: 140, height: 56, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Browser' },
        { id: uid(), type: 'rectangle', x: 120, y: 140, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'CDN' },
        { id: uid(), type: 'rectangle', x: 480, y: 140, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Load Balancer' },
        { id: uid(), type: 'arrow', x: 390, y: 76, width: -160, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 390, y: 76, width: 160, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
      ],
    },
    {
      title: 'Application Tier — Stateless Workloads',
      description: 'The Frontend serves the SPA (React, Vue) or SSR pages — a static file server (Nginx) that proxies API calls. The API Service handles business logic, auth, and data orchestration. Both are stateless — any replica can handle any request, making scaling trivial via HPA. Statelessness enables zero-downtime deployments: run a rolling update, the load balancer drains old pods while new ones spin up. Trade-off: stateless apps shift state management to database and cache layers, increasing their load. Mitigation: use Redis for sessions, rate limiting state, and hot data cache. In Kubernetes: both are Deployments with ClusterIP Services. Configure pod anti-affinity to spread replicas across nodes for high availability.',
      elements: [
        { id: uid(), type: 'rectangle', x: 320, y: 20, width: 140, height: 56, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Browser' },
        { id: uid(), type: 'rectangle', x: 120, y: 140, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'CDN' },
        { id: uid(), type: 'rectangle', x: 480, y: 140, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Load Balancer' },
        { id: uid(), type: 'rectangle', x: 100, y: 280, width: 140, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Frontend' },
        { id: uid(), type: 'rectangle', x: 500, y: 280, width: 140, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'API Service' },
        { id: uid(), type: 'arrow', x: 190, y: 196, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 550, y: 196, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 330, y: 76, width: -160, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 330, y: 76, width: 200, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
      ],
    },
    {
      title: 'Data Tier — Caching, Storage & Resilience',
      description: 'A Redis cache sits in front of PostgreSQL to absorb read traffic. Cache-aside pattern: read from cache, miss -> read from DB, write to cache, return. PostgreSQL is the source of truth. Production patterns: (1) Connection pooling via PgBouncer to avoid connection storms, (2) Read replicas for analytics queries, (3) Auto backups with WAL-G or pgBackRest, (4) Point-in-time recovery. Trade-offs: caching adds complexity (stale data, thundering herd, cold start on deploy). Mitigations: write-through for cache updates, add jitter to TTLs, pre-warm cache after deployments. In K8s: PostgreSQL as StatefulSet + PVC. Redis as StatefulSet or Redis Operator. PgBouncer as a sidecar or Deployment.',
      elements: [
        { id: uid(), type: 'rectangle', x: 320, y: 20, width: 140, height: 56, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Browser' },
        { id: uid(), type: 'rectangle', x: 120, y: 140, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'CDN' },
        { id: uid(), type: 'rectangle', x: 480, y: 140, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Load Balancer' },
        { id: uid(), type: 'rectangle', x: 100, y: 280, width: 140, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Frontend' },
        { id: uid(), type: 'rectangle', x: 500, y: 280, width: 140, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'API Service' },
        { id: uid(), type: 'rectangle', x: 280, y: 420, width: 180, height: 56, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'PostgreSQL' },
        { id: uid(), type: 'rectangle', x: 80, y: 420, width: 120, height: 50, stroke: M, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Redis Cache' },
        { id: uid(), type: 'arrow', x: 570, y: 336, width: -230, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 190, y: 196, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 550, y: 196, width: 0, height: 84, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 330, y: 76, width: -160, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 330, y: 76, width: 200, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'line', x: 260, y: 420, width: -60, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
      ],
    },
  ],
};

// ============================================================
// Tutorial 2: CQRS & Event Sourcing — write/read separation
// ============================================================
const CQRS: Tutorial = {
  id: 'cqrs',
  name: 'CQRS & Event Sourcing — Write/Read Separation',
  description: 'Separate write models from read models for high-scale systems. Covers event-driven architecture, Kafka integration, eventual consistency, and when NOT to use CQRS — a must-know pattern for senior SDE interviews.',
  difficulty: 'advanced',
  steps: [
    {
      title: 'Why CQRS? The Core Problem',
      description: 'In a standard CRUD app, the same model handles reads and writes. At low scale this works fine. But as traffic grows, reads and writes have different requirements: reads need denormalized views for fast querying, writes need normalized data for transactional consistency. CQRS separates them: commands (writes) go to a write-optimized store, queries (reads) hit a read-optimized store. The cost: eventual consistency between sides. The write model is authoritative; the read model catches up via event propagation. This pattern is proven for e-commerce catalogs, banking ledgers, and collaborative docs — any system where read workloads differ significantly from write workloads.',
      elements: [],
    },
    {
      title: 'Command Side — Write-optimized',
      description: 'The Command Service accepts writes (POST/PUT/PATCH), validates business rules, and writes to a normalized database (PostgreSQL or EventStoreDB). Every state change is recorded as an event — not just the final state, but the sequence of changes (event sourcing). This gives you an audit log, the ability to rebuild state from events, and the foundation for event-driven architectures. Key: commands never serve reads. The write model stays lean and ACID-compliant. Events are published to a message broker (Kafka) for downstream consumers.',
      elements: [
        { id: uid(), type: 'rectangle', x: 280, y: 20, width: 140, height: 50, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Client' },
        { id: uid(), type: 'rectangle', x: 100, y: 140, width: 160, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Command Service' },
        { id: uid(), type: 'rectangle', x: 100, y: 270, width: 160, height: 56, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Write DB (PG)' },
        { id: uid(), type: 'arrow', x: 350, y: 70, width: -190, height: 70, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 180, y: 196, width: 0, height: 74, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
      ],
    },
    {
      title: 'Event Bus & Read Side — Eventually Consistent Views',
      description: 'The Command Service emits events to Kafka: OrderCreated, InventoryAdjusted, PaymentProcessed. Multiple read services subscribe and build their own denormalized views. An OrderSearchService maintains Elasticsearch for full-text search. An OrderSummaryService maintains Redis for fast dashboards. This is the "eventual consistency" trade-off: the read side lags behind writes by milliseconds to seconds. Most domains tolerate this — search indexes don\'t need real-time accuracy, dashboards show "near real-time." If you need strict consistency, CQRS is not appropriate. Each read service owns its database (database-per-service pattern), preventing schema coupling.',
      elements: [
        { id: uid(), type: 'rectangle', x: 280, y: 20, width: 140, height: 50, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Client' },
        { id: uid(), type: 'rectangle', x: 100, y: 140, width: 160, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Command Service' },
        { id: uid(), type: 'rectangle', x: 100, y: 270, width: 160, height: 56, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Write DB' },
        { id: uid(), type: 'rectangle', x: 440, y: 140, width: 120, height: 50, stroke: M, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Kafka' },
        { id: uid(), type: 'rectangle', x: 440, y: 270, width: 120, height: 50, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Read Service' },
        { id: uid(), type: 'rectangle', x: 440, y: 390, width: 120, height: 50, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Read DB (ES)' },
        { id: uid(), type: 'arrow', x: 350, y: 70, width: -190, height: 70, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 180, y: 196, width: 0, height: 74, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 260, y: 165, width: 180, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 500, y: 190, width: 0, height: 80, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 500, y: 320, width: 0, height: 70, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
      ],
    },
    {
      title: 'When to Use CQRS — Decision Framework',
      description: 'CQRS is powerful but adds significant complexity. Use it when: (1) Read-to-write ratio exceeds 100:1 with complex queries, (2) Different teams own read vs write responsibilities, (3) You need an audit log of every state change. Do NOT use CQRS when: (1) Your app is CRUD with simple queries, (2) You need strong consistency for all reads, (3) Your team lacks experience with event-driven systems. Start with a simple CRUD app, add caching, then consider CQRS only when read complexity becomes a measured bottleneck. A Redis cache solves 90% of read scalability problems without the architectural overhead of CQRS.',
      elements: [
        { id: uid(), type: 'rectangle', x: 280, y: 20, width: 140, height: 50, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Client' },
        { id: uid(), type: 'rectangle', x: 100, y: 140, width: 160, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Command Service' },
        { id: uid(), type: 'rectangle', x: 100, y: 270, width: 160, height: 56, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Write DB' },
        { id: uid(), type: 'rectangle', x: 440, y: 140, width: 120, height: 50, stroke: M, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Kafka' },
        { id: uid(), type: 'rectangle', x: 440, y: 270, width: 120, height: 50, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Read Service' },
        { id: uid(), type: 'rectangle', x: 440, y: 390, width: 120, height: 50, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Read DB (ES)' },
        { id: uid(), type: 'rectangle', x: 100, y: 390, width: 160, height: 50, stroke: M, fill: 'transparent', strokeWidth: 2, opacity: 0.7, label: 'Redis Cache' },
        { id: uid(), type: 'arrow', x: 350, y: 70, width: -190, height: 70, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 180, y: 196, width: 0, height: 74, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 260, y: 165, width: 180, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 500, y: 190, width: 0, height: 80, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 500, y: 320, width: 0, height: 70, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'line', x: 180, y: 320, width: 260, height: 70, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
      ],
    },
  ],
};

// ============================================================
// Tutorial 3: K8 Production Deployment — from scratch to serving
// ============================================================
const K8_PRODUCTION: Tutorial = {
  id: 'k8-production',
  name: 'K8s Production Deployment — End to End',
  description: 'Map a real production K8s deployment from internet to database: Ingress -> Service -> Deployment -> HPA -> ConfigMap -> PVC -> Prometheus. Covers zero-downtime deployments, autoscaling, health probes, and production monitoring.',
  difficulty: 'intermediate',
  steps: [
    {
      title: 'Networking Layer — Getting Traffic In',
      description: 'Traffic flows: Internet -> Ingress Controller (NGINX) -> Service (ClusterIP) -> Pods. The Ingress terminates TLS (cert-manager for auto certs), routes by host/path, and can add rate limiting. The ClusterIP Service provides DNS-based load balancing via CoreDNS. Use an internal Service (no external endpoints) for inter-service communication. Production checklist: (1) TLS termination at Ingress, (2) HTTP->HTTPS redirect, (3) Rate limiting per IP, (4) Request logging with structured logs, (5) WAF for security headers.',
      elements: [
        { id: uid(), type: 'rectangle', x: 120, y: 20, width: 140, height: 50, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Internet' },
        { id: uid(), type: 'rectangle', x: 120, y: 120, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Ingress' },
        { id: uid(), type: 'rectangle', x: 120, y: 240, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Service' },
        { id: uid(), type: 'rectangle', x: 380, y: 240, width: 100, height: 50, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 0.7, label: 'cert-manager' },
        { id: uid(), type: 'arrow', x: 190, y: 70, width: 0, height: 50, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 190, y: 176, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'line', x: 260, y: 265, width: 120, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
      ],
    },
    {
      title: 'Workload Layer — Deployment & Config',
      description: 'The Deployment runs 3 Pod replicas with resource limits, health probes, and a ConfigMap for environment config. Each Pod has: (1) requests vs limits for CPU/memory, (2) liveness probe (/healthz) to restart unhealthy containers, (3) readiness probe (/ready) to remove from Service when not ready, (4) startup probe for slow-starting apps. The ConfigMap mounts as env vars or a volume. Production: never hardcode config in the image. Use ConfigMaps for non-sensitive data, Secrets for sensitive. For zero-downtime: configure podDisruptionBudget, set terminationGracePeriodSeconds, implement graceful shutdown in the app (SIGTERM handler).',
      elements: [
        { id: uid(), type: 'rectangle', x: 120, y: 20, width: 140, height: 50, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Internet' },
        { id: uid(), type: 'rectangle', x: 120, y: 120, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Ingress' },
        { id: uid(), type: 'rectangle', x: 120, y: 240, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Service (ClusterIP)' },
        { id: uid(), type: 'rectangle', x: 120, y: 360, width: 160, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Deployment x3' },
        { id: uid(), type: 'rectangle', x: 400, y: 360, width: 120, height: 50, stroke: M, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'ConfigMap' },
        { id: uid(), type: 'arrow', x: 190, y: 70, width: 0, height: 50, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 190, y: 176, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 190, y: 296, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'line', x: 280, y: 388, width: 120, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
      ],
    },
    {
      title: 'Autoscaling, Storage & Monitoring',
      description: 'Complete the architecture: HPA autoscales the Deployment based on CPU (>70%), a PVC provides persistent storage, and Prometheus scrapes /metrics for monitoring. The HPA: kubectl autoscale deployment web --cpu-percent=70 --min=3 --max=10. The PVC binds to a StorageClass (SSD for databases, HDD for logs). Prometheus Operator deploys ServiceMonitors that auto-discover metrics endpoints. AlertManager sends PagerDuty/Slack alerts. Grafana dashboards visualize RED metrics (Rate, Errors, Duration). Pro tip: add a PodDisruptionBudget to prevent the HPA or node drain from taking down too many Pods simultaneously.',
      elements: [
        { id: uid(), type: 'rectangle', x: 120, y: 20, width: 140, height: 50, stroke: B, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Internet' },
        { id: uid(), type: 'rectangle', x: 120, y: 120, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Ingress' },
        { id: uid(), type: 'rectangle', x: 120, y: 240, width: 140, height: 56, stroke: C, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Service' },
        { id: uid(), type: 'rectangle', x: 120, y: 360, width: 160, height: 56, stroke: G, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'Deployment x5' },
        { id: uid(), type: 'rectangle', x: 400, y: 360, width: 120, height: 50, stroke: M, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'ConfigMap' },
        { id: uid(), type: 'rectangle', x: 430, y: 240, width: 100, height: 50, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 1, label: 'HPA' },
        { id: uid(), type: 'rectangle', x: 120, y: 480, width: 140, height: 56, stroke: O, fill: 'transparent', strokeWidth: 2, opacity: 0.8, label: 'PVC -> PV' },
        { id: uid(), type: 'rectangle', x: 430, y: 480, width: 100, height: 50, stroke: M, fill: 'transparent', strokeWidth: 2, opacity: 0.8, label: 'Prometheus' },
        { id: uid(), type: 'arrow', x: 190, y: 70, width: 0, height: 50, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 190, y: 176, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 190, y: 296, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'arrow', x: 190, y: 416, width: 0, height: 64, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1.5, opacity: 0.6 },
        { id: uid(), type: 'line', x: 280, y: 388, width: 150, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
        { id: uid(), type: 'line', x: 480, y: 290, width: 0, height: 70, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
        { id: uid(), type: 'line', x: 480, y: 480, width: -230, height: 0, stroke: '#4a4a4a', fill: 'transparent', strokeWidth: 1, opacity: 0.4 },
      ],
    },
  ],
};

export const TUTORIALS: Tutorial[] = [THREE_TIER, CQRS, K8_PRODUCTION];
