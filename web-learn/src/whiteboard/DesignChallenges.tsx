import { useState } from 'react';
import { useEditor } from './store';

/* ============================================================
   Design Challenges — system design prompts with reference
   solutions that learners can compare against their own work.
   ============================================================ */

interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  prompt: string;
  requirements: string[];
  hints: string[];
  referenceSolution: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'ch-scalable-api',
    title: 'Design a Scalable REST API',
    difficulty: 'intermediate',
    prompt: 'Design a horizontally scalable REST API service that handles traffic spikes, stores data persistently, and is observable.',
    requirements: [
      'Load balancer distributing traffic across API instances',
      'At least 3 API server replicas (stateless)',
      'Persistent database with read replicas',
      'Health check endpoints for the load balancer',
      'Metrics endpoint for Prometheus scraping',
    ],
    hints: [
      'Consider a ClusterIP Service → Deployment pattern',
      'Use a ConfigMap for environment configuration',
      'Read replicas help scale database reads',
      'Add a /healthz and /metrics endpoint',
    ],
    referenceSolution: 'The reference solution uses: Ingress → Service (ClusterIP) → Deployment (×3 replicas) with a ConfigMap for config, PVC-backed PostgreSQL as primary DB with a read replica, and Prometheus scraping /metrics. HPA scales based on CPU at 70%.',
  },
  {
    id: 'ch-event-driven',
    title: 'Event-Driven Microservices',
    difficulty: 'advanced',
    prompt: 'Design an event-driven architecture where a producer emits events and multiple consumers process them independently.',
    requirements: [
      'A message queue or event bus as the backbone',
      'One producer service that emits events',
      'At least two consumer services that process different event types',
      'Each consumer has its own data store',
      'Dead-letter queue for failed events',
    ],
    hints: [
      'Apache Kafka or RabbitMQ as the message broker',
      'Consumers should be in separate Deployments',
      'Each consumer owns its own database (database-per-service)',
      'Add a DLQ consumer for observability',
    ],
    referenceSolution: 'Reference: Kafka topic "orders" with 3 partitions. Order Service produces events. Payment Consumer (×2 replicas) processes payment events → writes to Payment DB. Notification Consumer (×2 replicas) processes email/SMS events → writes to Notification DB. Failed events route to a DLQ topic monitored by AlertManager.',
  },
  {
    id: 'ch-secure-k8s',
    title: 'Secure K8s Production Cluster',
    difficulty: 'expert',
    prompt: 'Design a production-grade Kubernetes architecture that meets security compliance requirements including network isolation, secrets management, and RBAC.',
    requirements: [
      'Multi-tenant namespaces with resource quotas',
      'Network policies restricting pod-to-pod communication',
      'Secrets stored externally (Vault or External Secrets)',
      'Pod Security Standards (restricted profile)',
      'RBAC roles for developers vs. admins',
      'Image scanning in CI/CD pipeline',
    ],
    hints: [
      'Use Kyverno or OPA for policy enforcement',
      'External Secrets Operator syncs from Vault',
      'Network policies should default-deny then allow specific ingress/egress',
      'Separate namespaces: dev, staging, prod with different quotas',
    ],
    referenceSolution: 'Reference: 3 namespaces (dev/staging/prod) each with ResourceQuota + LimitRange. Default-deny NetworkPolicy, then allow ingress from Ingress Controller only. External Secrets Operator syncs from HashiCorp Vault. PSS restricted profile via Kyverno. RBAC: developers get edit in dev, view in staging; admins get cluster-admin.',
  },
];

const diffColors: Record<string, string> = {
  beginner: 'var(--terminal-green)',
  intermediate: 'var(--blueprint)',
  advanced: 'var(--terminal-yellow)',
  expert: 'var(--terminal-red)',
};

interface DesignChallengesProps {
  onClose: () => void;
}

export default function DesignChallenges({ onClose }: DesignChallengesProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<string | null>(null);
  const setElements = useEditor(s => s.setElements);

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      width: 400,
      maxHeight: 'calc(100% - 32px)',
      overflowY: 'auto',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--rule)',
      boxShadow: 'var(--shadow-panel)',
      zIndex: 20,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--rule-soft)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--blueprint)',
      }}>
        <span>Design Challenges</span>
        <button onClick={onClose} style={{
          border: 'none', background: 'transparent', color: 'var(--ink-mute)',
          cursor: 'pointer', fontSize: '1rem', padding: '2px 6px',
        }}>✕</button>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--ink-mute)', marginBottom: 14 }}>
          Try to build the architecture on the canvas, then compare with the reference solution.
        </div>

        {CHALLENGES.map(ch => (
          <div key={ch.id} style={{
            marginBottom: 12,
            border: `1px solid ${expanded === ch.id ? 'var(--blueprint)' : 'var(--rule-soft)'}`,
            overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}>
            {/* Header */}
            <button
              onClick={() => setExpanded(expanded === ch.id ? null : ch.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                border: 'none',
                background: expanded === ch.id ? 'var(--blueprint-tint)' : 'transparent',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
                color: 'var(--ink)',
                fontWeight: 500,
              }}
            >
              <span>{ch.title}</span>
              <DifficultyBadge difficulty={ch.difficulty} />
            </button>

            {/* Expanded content */}
            {expanded === ch.id && (
              <div style={{ padding: '0 12px 12px' }}>
                <p style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: '0.82rem',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.5,
                  margin: '10px 0',
                }}>
                  {ch.prompt}
                </p>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--blueprint)', marginBottom: 6, letterSpacing: '0.08em' }}>
                    Requirements
                  </div>
                  {ch.requirements.map((r, i) => (
                    <div key={i} style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.7rem',
                      color: 'var(--ink-soft)',
                      padding: '3px 0 3px 12px',
                      borderLeft: '2px solid var(--rule-soft)',
                      marginBottom: 3,
                    }}>
                      {r}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button
                    onClick={() => { setElements([]); setShowSolution(null); }}
                    style={miniBtn}
                  >
                    Start Designing
                  </button>
                  <button
                    onClick={() => setShowSolution(showSolution === ch.id ? null : ch.id)}
                    style={{ ...miniBtn, background: 'var(--blueprint-tint)', borderColor: 'var(--blueprint)', color: 'var(--blueprint)' }}
                  >
                    {showSolution === ch.id ? 'Hide Reference' : 'Show Reference'}
                  </button>
                </div>

                {showSolution === ch.id && (
                  <div style={{
                    padding: '10px 12px',
                    background: 'var(--bg)',
                    border: '1px solid var(--terminal-green)',
                    borderLeft: '3px solid var(--terminal-green)',
                    fontFamily: "'Source Serif 4', serif",
                    fontSize: '0.82rem',
                    color: 'var(--ink-soft)',
                    lineHeight: 1.5,
                  }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--terminal-green)', marginBottom: 4, letterSpacing: '0.08em' }}>
                      Reference Solution
                    </div>
                    {ch.referenceSolution}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.55rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: diffColors[difficulty] || 'var(--ink-mute)',
      border: `1px solid ${diffColors[difficulty] || 'var(--ink-mute)'}`,
      padding: '1px 5px',
      flexShrink: 0,
    }}>
      {difficulty}
    </span>
  );
}

const miniBtn: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.68rem',
  padding: '6px 12px',
  border: '1px solid var(--rule)',
  background: 'transparent',
  color: 'var(--ink-soft)',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};
