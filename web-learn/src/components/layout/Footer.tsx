export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--rule-soft)',
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
        <div style={{ display: 'flex', gap: 24 }}>
          <a
            href="https://github.com/tushargautam/K8-docker-learn"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--ink-soft)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blueprint)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
          >
            GitHub
          </a>
          <a
            href="#"
            style={{ color: 'var(--ink-soft)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blueprint)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
          >
            Glossary
          </a>
        </div>
      </div>
    </footer>
  );
}
