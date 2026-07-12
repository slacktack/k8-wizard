import type { Architecture } from '../components/diagram/ArchitectureDiagram';

/* Real-world application architectures you can build on Kubernetes.
   Each maps cleanly onto the concepts taught across the curriculum. */

export const ARCHITECTURES: Architecture[] = [
  {
    id: 'web-app',
    name: '3-Tier Web App',
    blurb: 'The classic stack: a browser hits an Ingress, which routes to a stateless frontend and API, backed by a managed Postgres. Rolling updates ship new versions with zero downtime.',
    tiers: [
      { label: 'Edge', nodes: [{ label: 'Ingress', sub: 'TLS · routing', kind: 'ingress' }] },
      { label: 'Web', nodes: [
        { label: 'frontend', sub: 'Deployment ×3', kind: 'workload' },
        { label: 'api', sub: 'Deployment ×4', kind: 'workload' },
      ] },
      { label: 'Service', nodes: [
        { label: 'frontend-svc', sub: 'ClusterIP', kind: 'service' },
        { label: 'api-svc', sub: 'ClusterIP', kind: 'service' },
      ] },
      { label: 'Data', nodes: [{ label: 'postgres', sub: 'StatefulSet + PVC', kind: 'data' }] },
    ],
  },
  {
    id: 'microservices',
    name: 'Microservices Shop',
    blurb: 'An e-commerce backend split into independent services behind an API gateway. Each service scales on its own and owns its datastore — a Deployment per service, a Service per Deployment.',
    tiers: [
      { label: 'Edge', nodes: [{ label: 'API Gateway', sub: 'Ingress + auth', kind: 'ingress' }] },
      { label: 'Services', nodes: [
        { label: 'catalog', sub: 'Deployment', kind: 'workload' },
        { label: 'orders', sub: 'Deployment', kind: 'workload' },
        { label: 'payments', sub: 'Deployment', kind: 'workload' },
        { label: 'cart', sub: 'Deployment', kind: 'workload' },
      ] },
      { label: 'State', nodes: [
        { label: 'catalog-db', sub: 'Postgres', kind: 'data' },
        { label: 'orders-db', sub: 'Postgres', kind: 'data' },
        { label: 'redis', sub: 'cache', kind: 'data' },
      ] },
    ],
  },
  {
    id: 'gitops',
    name: 'GitOps Delivery',
    blurb: 'Push to Git and the cluster reconciles itself. Argo CD watches your manifests repo and applies changes automatically — no kubectl from a laptop, every change audited in Git.',
    tiers: [
      { label: 'Source', nodes: [{ label: 'Git repo', sub: 'manifests', kind: 'external' }] },
      { label: 'Control', nodes: [{ label: 'Argo CD', sub: 'reconcile loop', kind: 'control' }] },
      { label: 'Cluster', nodes: [
        { label: 'staging', sub: 'namespace', kind: 'workload' },
        { label: 'prod', sub: 'namespace', kind: 'workload' },
      ] },
    ],
  },
  {
    id: 'autoscale',
    name: 'Autoscaling API',
    blurb: 'Traffic spikes, pods multiply. The Horizontal Pod Autoscaler reads CPU/memory from the metrics server and adds replicas; the Cluster Autoscaler adds nodes when pods have nowhere to land.',
    tiers: [
      { label: 'Load', nodes: [{ label: 'traffic', sub: 'req/sec ↑', kind: 'external' }] },
      { label: 'Signal', nodes: [
        { label: 'metrics-server', sub: 'CPU · memory', kind: 'control' },
        { label: 'HPA', sub: '3 → 20 pods', kind: 'control' },
      ] },
      { label: 'Compute', nodes: [
        { label: 'api', sub: 'ReplicaSet', kind: 'workload' },
        { label: 'Cluster Autoscaler', sub: '+nodes', kind: 'control' },
      ] },
    ],
  },
  {
    id: 'observability',
    name: 'Observability Stack',
    blurb: 'See everything. Prometheus scrapes metrics, Loki collects logs, and Grafana unifies them into dashboards and alerts — the three pillars, all running in-cluster.',
    tiers: [
      { label: 'Apps', nodes: [
        { label: 'workloads', sub: '/metrics · stdout', kind: 'workload' },
      ] },
      { label: 'Collect', nodes: [
        { label: 'Prometheus', sub: 'metrics', kind: 'control' },
        { label: 'Loki', sub: 'logs', kind: 'control' },
        { label: 'Tempo', sub: 'traces', kind: 'control' },
      ] },
      { label: 'View', nodes: [{ label: 'Grafana', sub: 'dashboards · alerts', kind: 'service' }] },
    ],
  },
  {
    id: 'ml-inference',
    name: 'ML Inference',
    blurb: 'Serve models at scale. Requests route to model servers pinned to GPU nodes via taints/tolerations, autoscaling on queue depth while a batch CronJob retrains overnight.',
    tiers: [
      { label: 'Edge', nodes: [{ label: 'Ingress', sub: 'gRPC / REST', kind: 'ingress' }] },
      { label: 'Serving', nodes: [
        { label: 'model-server', sub: 'Deployment (GPU)', kind: 'workload' },
        { label: 'HPA', sub: 'queue depth', kind: 'control' },
      ] },
      { label: 'Infra', nodes: [
        { label: 'GPU node pool', sub: 'taints/tolerations', kind: 'data' },
        { label: 'retrain', sub: 'CronJob', kind: 'workload' },
      ] },
    ],
  },
];
