import React from 'react';

/* ============================================================
   ArchitectureDiagram
   ------------------------------------------------------------
   Renders a multi-tier application architecture as themed boxes
   connected top-to-bottom. Unlike the single-chain UMLDiagram,
   each tier holds several nodes so real app topologies (a gateway
   fanning out to services, services backed by databases) read
   clearly. Colours come from the terminal palette so the diagram
   sits inside the same visual system in light and dark themes.
   ============================================================ */

export type NodeKind = 'ingress' | 'service' | 'workload' | 'data' | 'external' | 'control';

export interface ArchNode {
  label: string;
  sub?: string;
  kind?: NodeKind;
}

export interface ArchTier {
  label?: string;
  nodes: ArchNode[];
}

export interface Architecture {
  id: string;
  name: string;
  blurb: string;
  tiers: ArchTier[];
}

const KIND_ACCENT: Record<NodeKind, string> = {
  ingress: 'var(--terminal-blue)',
  service: 'var(--terminal-cyan)',
  workload: 'var(--terminal-green)',
  data: 'var(--terminal-orange)',
  external: 'var(--terminal-magenta)',
  control: 'var(--terminal-yellow)',
};

function Node({ node }: { node: ArchNode }) {
  const accent = KIND_ACCENT[node.kind ?? 'workload'];
  return (
    <div
      className="arch-node"
      style={{
        position: 'relative',
        border: '1px solid var(--terminal-border)',
        borderTop: `2px solid ${accent}`,
        background: 'var(--bg-elevated)',
        padding: '10px 16px',
        minWidth: 128,
        textAlign: 'center',
        transition: 'transform 0.15s var(--ease-snappy), border-color 0.15s',
      }}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
        {node.label}
      </div>
      {node.sub && (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'var(--ink-mute)', marginTop: 3, letterSpacing: '0.02em' }}>
          {node.sub}
        </div>
      )}
    </div>
  );
}

function TierConnector() {
  return (
    <div aria-hidden style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
      <svg width="16" height="20" viewBox="0 0 16 20" style={{ display: 'block' }}>
        <line x1="8" y1="0" x2="8" y2="14" stroke="var(--terminal-border)" strokeWidth="1.5" />
        <polygon points="4,12 8,19 12,12" fill="var(--terminal-border)" />
      </svg>
    </div>
  );
}

export default function ArchitectureDiagram({ architecture }: { architecture: Architecture }) {
  return (
    <div
      style={{
        border: '1px solid var(--terminal-border)',
        background: 'var(--terminal-bg)',
        padding: '24px 20px',
        backgroundImage: 'radial-gradient(var(--terminal-grid) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    >
      {architecture.tiers.map((tier, ti) => (
        <React.Fragment key={ti}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {tier.label && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--terminal-mute)',
                  minWidth: 64,
                  textAlign: 'right',
                }}
                className="arch-tier-label"
              >
                {tier.label}
              </span>
            )}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {tier.nodes.map((node, ni) => (
                <Node key={ni} node={node} />
              ))}
            </div>
          </div>
          {ti < architecture.tiers.length - 1 && <TierConnector />}
        </React.Fragment>
      ))}
    </div>
  );
}
