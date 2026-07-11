import CopyButton from '../ui/CopyButton';

interface YamlBlockProps {
  filename: string;
  code: string;
}

export default function YamlBlock({ filename, code }: YamlBlockProps) {
  return (
    <figure style={{ margin: '16px 0' }}>
      {/* Terminal Window */}
      <div
        style={{
          border: '1px solid var(--terminal-border)',
          background: 'var(--terminal-bg)',
          overflow: 'hidden',
        }}
      >
        {/* Chrome */}
        <div
          style={{
            height: 28,
            background: 'var(--terminal-chrome-bg)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 8,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          <span
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              color: 'var(--terminal-chrome-text)',
            }}
          >
            {filename}
          </span>
          <div style={{ width: 60 }} />
        </div>

        {/* Code */}
        <div style={{ padding: '0 16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <CopyButton text={code} />
          </div>
          <pre
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              lineHeight: 1.5,
              color: 'var(--terminal-text)',
              overflowX: 'auto',
              padding: '12px 0',
              margin: 0,
            }}
          >
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </figure>
  );
}
