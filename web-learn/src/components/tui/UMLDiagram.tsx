interface UMLNode {
  id: string;
  label: string;
  sublabel?: string;
  children?: UMLNode[];
}

interface UMLDiagramProps {
  title?: string;
  nodes: UMLNode[];
  direction?: 'vertical' | 'horizontal';
}

function UMLNodeBox({ node, isLast }: { node: UMLNode; isLast: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          border: '1px solid var(--rule)',
          background: 'var(--bg-elevated)',
          padding: '10px 24px',
          display: 'inline-block',
          minWidth: 160,
          transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-tint)'; e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--terminal-cyan)', fontWeight: 500 }}>
          {node.label}
        </div>
        {node.sublabel && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--ink-soft)', marginTop: 2 }}>
            {node.sublabel}
          </div>
        )}
      </div>
      {!isLast && (
        <div style={{ padding: '4px 0' }}>
          <svg width="20" height="24" viewBox="0 0 20 24" style={{ margin: '0 auto', display: 'block' }}>
            <line x1="10" y1="0" x2="10" y2="20" stroke="var(--rule)" strokeWidth="1.5" className="uml-line" />
            <polygon points="6,18 10,24 14,18" fill="var(--rule)" />
          </svg>
        </div>
      )}
      {node.children && (
        <div style={{ paddingTop: 8 }}>
          {node.children.map((child, ci) => (
            <UMLNodeBox key={child.id} node={child} isLast={ci === (node.children?.length || 0) - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function UMLDiagram({ title, nodes }: UMLDiagramProps) {
  return (
    <div
      style={{
        padding: '16px 0',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {title && (
        <div
          style={{
            textAlign: 'center',
            fontFamily: "'VT323', monospace",
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--tui-gold)',
            marginBottom: 16,
          }}
        >
          ─── {title} ───
        </div>
      )}

      {nodes.map((node, i) => (
        <UMLNodeBox key={node.id} node={node} isLast={i === nodes.length - 1} />
      ))}
    </div>
  );
}

// Preset diagrams for common K8 concepts
export const K8_ARCHITECTURE_UML: UMLNode[] = [
  { id: 'ingress', label: 'Ingress', sublabel: 'HTTP Router' },
  { id: 'service', label: 'Service', sublabel: 'Stable Endpoint' },
  { id: 'deployment', label: 'Deployment', sublabel: 'Desired State', children: [
    { id: 'replicaset', label: 'ReplicaSet', sublabel: 'Pod Controller' },
  ]},
  { id: 'replicaset-pods', label: 'Pod', sublabel: 'Running Container' },
];

export const DOCKER_BUILD_UML: UMLNode[] = [
  { id: 'dockerfile', label: 'Dockerfile', sublabel: 'Recipe' },
  { id: 'build', label: 'docker build', sublabel: 'Build Step' },
  { id: 'image', label: 'Image', sublabel: 'Read-only Template' },
  { id: 'run', label: 'docker run', sublabel: 'Runtime' },
  { id: 'container', label: 'Container', sublabel: 'Running Instance' },
];
