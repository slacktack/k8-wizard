interface K8VizDiagramProps {
  steps?: string[][];
}

const defaultSteps = [
  ['Ingress', 'HTTP Router'],
  ['Service', 'Stable Endpoint'],
  ['Deployment', 'Desired State'],
  ['Pod', 'Running Container'],
];

export default function K8VizDiagram({ steps = defaultSteps }: K8VizDiagramProps) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        lineHeight: 1.4,
        color: 'var(--tui-text)',
        padding: '8px 0',
      }}
    >
      {steps.map((step, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              border: '1px solid var(--tui-border)',
              padding: '4px 16px',
              background: 'var(--tui-bg)',
            }}
          >
            <div style={{ color: 'var(--tui-cyan)', fontSize: '0.82rem' }}>{step[0]}</div>
            <div style={{ color: 'var(--tui-mute)', fontSize: '0.65rem' }}>{step[1]}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ padding: '2px 0' }}>
              <span style={{ color: 'var(--tui-border)' }}>│</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
