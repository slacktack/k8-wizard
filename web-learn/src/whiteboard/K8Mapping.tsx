import { useEditor } from './store';

/* ============================================================
   K8 Resource Mapping — overlays Kubernetes resource type
   labels onto whiteboard components based on their label text.
   ============================================================ */

interface K8Mapping {
  k8Resource: string;
  k8Kind: string;
  description: string;
}

const MAPPINGS: Record<string, K8Mapping> = {
  'Browser': { k8Resource: 'N/A (external)', k8Kind: 'Client', description: 'External client, not running in cluster' },
  'Client': { k8Resource: 'N/A (external)', k8Kind: 'Client', description: 'External client, not running in cluster' },
  'Mobile App': { k8Resource: 'N/A (external)', k8Kind: 'Client', description: 'External client, not running in cluster' },
  'CDN': { k8Resource: 'N/A (external)', k8Kind: 'CDN', description: 'Content Delivery Network, external to cluster' },
  'Load Balancer': { k8Resource: 'Service (type: LoadBalancer)', k8Kind: 'Service', description: 'Exposes service to external traffic via cloud LB' },
  'API Gateway': { k8Resource: 'Ingress / Gateway API', k8Kind: 'Ingress', description: 'Routes external traffic to internal services' },
  'Ingress': { k8Resource: 'Ingress', k8Kind: 'Ingress', description: 'Ingress resource with TLS termination and routing rules' },
  'Service': { k8Resource: 'Service (ClusterIP)', k8Kind: 'Service', description: 'Stable network endpoint for a set of Pods' },
  'Frontend': { k8Resource: 'Deployment', k8Kind: 'Workload', description: 'Stateless frontend, typically Nginx/React served via Ingress' },
  'API Service': { k8Resource: 'Deployment + Service', k8Kind: 'Workload', description: 'Stateless API server behind a ClusterIP Service' },
  'Service (ClusterIP)': { k8Resource: 'Service (ClusterIP)', k8Kind: 'Service', description: 'Internal cluster networking for pod-to-pod communication' },
  'Catalog Svc': { k8Resource: 'Deployment + Service', k8Kind: 'Workload', description: 'Microservice with its own ClusterIP Service' },
  'Order Svc': { k8Resource: 'Deployment + Service', k8Kind: 'Workload', description: 'Microservice with its own ClusterIP Service' },
  'Payment Svc': { k8Resource: 'Deployment + Service', k8Kind: 'Workload', description: 'Microservice with its own ClusterIP Service' },
  'Worker': { k8Resource: 'Deployment', k8Kind: 'Workload', description: 'Background worker processing jobs/events' },
  'Function': { k8Resource: 'Knative Service / Job', k8Kind: 'Workload', description: 'Serverless function or batch Job' },
  'Deployment ×3': { k8Resource: 'Deployment (3 replicas)', k8Kind: 'Workload', description: 'Deployment with 3 Pod replicas for HA' },
  'Deployment ×5': { k8Resource: 'Deployment (5 replicas)', k8Kind: 'Workload', description: 'Deployment with 5 Pod replicas, autoscaled' },
  'SQL DB': { k8Resource: 'StatefulSet + PVC', k8Kind: 'Stateful', description: 'Stateful application with persistent storage' },
  'PostgreSQL': { k8Resource: 'StatefulSet + PVC', k8Kind: 'Stateful', description: 'PostgreSQL database running as a StatefulSet' },
  'NoSQL DB': { k8Resource: 'StatefulSet + PVC', k8Kind: 'Stateful', description: 'NoSQL database like MongoDB with persistent volumes' },
  'Cache': { k8Resource: 'Deployment + PVC (or Redis Operator)', k8Kind: 'Stateful', description: 'Redis/Memcached cache layer' },
  'Redis': { k8Resource: 'Deployment + PVC (or Redis Operator)', k8Kind: 'Stateful', description: 'Redis cache or session store' },
  'Object Store': { k8Resource: 'N/A (external, e.g., S3)', k8Kind: 'External', description: 'External object storage, not typically in-cluster' },
  'Message Queue': { k8Resource: 'StatefulSet (Kafka/RabbitMQ)', k8Kind: 'Stateful', description: 'Message broker running as StatefulSet' },
  'Event Bus': { k8Resource: 'StatefulSet (Kafka/NATS)', k8Kind: 'Stateful', description: 'Event streaming platform as StatefulSet' },
  'Stream': { k8Resource: 'StatefulSet (Kafka)', k8Kind: 'Stateful', description: 'Stream processing with Kafka or similar' },
  'ConfigMap': { k8Resource: 'ConfigMap', k8Kind: 'Config', description: 'Non-sensitive configuration data injected into Pods' },
  'HPA': { k8Resource: 'HorizontalPodAutoscaler', k8Kind: 'Autoscaling', description: 'Auto-scales Deployment replicas based on metrics' },
  'PVC → PV': { k8Resource: 'PersistentVolumeClaim → PersistentVolume', k8Kind: 'Storage', description: 'Persistent storage request bound to a PV' },
  'Prometheus': { k8Resource: 'Prometheus Operator / StatefulSet', k8Kind: 'Monitoring', description: 'Monitoring and metrics collection' },
};

interface K8MappingProps {
  onClose: () => void;
}

export default function K8MappingPanel({ onClose }: K8MappingProps) {
  const elements = useEditor(s => s.elements);

  // Find all elements with labels that have K8 mappings
  const mapped = elements
    .filter(el => el.label && MAPPINGS[el.label])
    .map(el => ({ el, mapping: MAPPINGS[el.label!] }));

  // Get unmapped elements too
  const unmapped = elements.filter(el => el.label && !MAPPINGS[el.label]);

  // Count by K8 kind
  const kindCounts: Record<string, number> = {};
  mapped.forEach(m => {
    kindCounts[m.mapping.k8Kind] = (kindCounts[m.mapping.k8Kind] || 0) + 1;
  });

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      width: 340,
      maxHeight: 'calc(100% - 32px)',
      overflowY: 'auto',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--rule)',
      boxShadow: 'var(--shadow-panel)',
      zIndex: 20,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        borderBottom: '1px solid var(--rule-soft)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--blueprint)',
      }}>
        <span>K8 Resource Mapping</span>
        <button onClick={onClose} style={{
          border: 'none', background: 'transparent', color: 'var(--ink-mute)',
          cursor: 'pointer', fontSize: '1rem', padding: '2px 6px',
        }}>✕</button>
      </div>

      <div style={{ padding: '10px 12px' }}>
        {/* Summary */}
        {mapped.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 14,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.62rem',
          }}>
            {Object.entries(kindCounts).map(([kind, count]) => (
              <span key={kind} style={{
                padding: '2px 8px',
                border: '1px solid var(--rule-soft)',
                color: 'var(--ink)',
                background: 'var(--blueprint-tint)',
              }}>
                {kind}: {count}
              </span>
            ))}
          </div>
        )}

        {mapped.length === 0 && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: 'var(--ink-mute)',
            padding: '20px 0',
            textAlign: 'center',
          }}>
            Drop components from the palette to see their K8 resource mappings.
          </div>
        )}

        {/* Mapping list */}
        {mapped.map((m) => (
          <div key={m.el.id} style={{
            padding: '8px 10px',
            marginBottom: 6,
            border: '1px solid var(--rule-soft)',
            borderLeft: `3px solid var(--blueprint)`,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              color: 'var(--ink)',
              fontWeight: 500,
              marginBottom: 2,
            }}>
              {m.el.label}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              color: 'var(--blueprint)',
              marginBottom: 2,
            }}>
              {m.mapping.k8Resource}
            </div>
            <div style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: '0.72rem',
              color: 'var(--ink-soft)',
              lineHeight: 1.4,
            }}>
              {m.mapping.description}
            </div>
          </div>
        ))}

        {unmapped.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}>
              Unmapped components ({unmapped.length})
            </div>
            {unmapped.map(el => (
              <div key={el.id} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                color: 'var(--ink-mute)',
                padding: '3px 8px',
                borderLeft: '2px solid var(--rule-soft)',
                marginBottom: 2,
              }}>
                {el.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
