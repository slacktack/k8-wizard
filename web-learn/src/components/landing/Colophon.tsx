import CopyButton from '../ui/CopyButton';

export default function Colophon() {
  const cloneCmd = 'git clone https://github.com/tushargautam/K8-docker-learn.git';

  return (
    <section className="section-padding">
      <div className="container">
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            color: 'var(--ink-soft)',
          }}
        >
          <p style={{ marginBottom: 12, color: 'var(--ink-mute)' }}>Get the source</p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: 'var(--code-bg)',
              border: '1px solid var(--rule-soft)',
            }}
          >
            <code style={{ fontSize: '0.95rem', color: 'var(--ink)', flex: 1 }}>
              $ {cloneCmd}
            </code>
            <CopyButton text={cloneCmd} label="Copy" />
          </div>
          <p style={{ marginTop: 8, color: 'var(--ink-mute)', fontSize: '0.7rem' }}>
            MIT License — free to use, share, and remix.
          </p>
        </div>
      </div>
    </section>
  );
}
