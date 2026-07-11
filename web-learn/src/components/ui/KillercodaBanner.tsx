interface KillercodaBannerProps {
  lessonId?: string;
  compact?: boolean;
}

export default function KillercodaBanner({ lessonId, compact = false }: KillercodaBannerProps) {
  const href = lessonId
    ? `https://killercoda.com/playgrounds/scenario/kubernetes?ref=k8wizard&lesson=${lessonId}`
    : 'https://killercoda.com/playgrounds/scenario/kubernetes';

  const content = compact ? (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
      Want real cluster practice?{' '}
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blueprint)', textDecoration: 'underline' }}>
        Killercoda ↗
      </a>
      {' '}offers free browser-based K8s clusters (no affiliation).
    </div>
  ) : (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: 'var(--ink)', marginBottom: 4 }}>
          Want to run these commands on a real cluster?
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
          Killercoda provides free browser-based Kubernetes environments. No signup required. No affiliation.
        </div>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '8px 16px',
          background: 'var(--blueprint)',
          color: 'var(--bg)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-bright)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--blueprint)'; }}
      >
        Open Killercoda ↗
      </a>
    </div>
  );

  return (
    <div
      style={{
        background: 'var(--blueprint-tint)',
        border: '1px solid var(--blueprint)',
        padding: compact ? '8px 14px' : '12px 16px',
        marginTop: compact ? 8 : 16,
      }}
    >
      {content}
    </div>
  );
}
