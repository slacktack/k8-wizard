export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--rule)',
        padding: '32px 0',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: 'var(--ink-mute)' }}>
          © {year} K8 Wizard — MIT
        </span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a
            href="https://github.com/slacktack/k8-wizard"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--ink-soft)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blueprint)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
          >
            GitHub
          </a>
          <a
            href="https://killercoda.com/playgrounds/scenario/kubernetes"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--terminal-green)', textDecoration: 'none', transition: 'color 0.15s', fontSize: '0.72rem' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--terminal-green)')}
          >
            Powered by Killercoda
          </a>
        </div>
      </div>
      {/* Legal disclaimer */}
      <div
        style={{
          maxWidth: 1200,
          margin: '16px auto 0',
          padding: '0 32px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          color: 'var(--ink-mute)',
          textAlign: 'center',
        }}
      >
        K8 Wizard is an open-source learning platform following official Kubernetes documentation. Hands-on practice available on Killercoda. We are not affiliated with Killercoda. All trademarks belong to their respective owners.
      </div>
    </footer>
  );
}
