interface DiagramBlockProps {
  lines: string[];
}

export default function DiagramBlock({ lines }: DiagramBlockProps) {
  return (
    <div
      style={{
        margin: '24px 0',
        padding: '20px',
        background: 'var(--code-bg)',
        border: '1px solid var(--rule-soft)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        lineHeight: 1.4,
        overflowX: 'auto',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <pre style={{ margin: 0, color: 'var(--ink)', width: '100%', maxWidth: '100%' }}>
        <code style={{ width: '100%', maxWidth: '100%' }}>{lines.map(l => l.replace(/\|/g, '│').replace(/-/g, '─')).join('\n')}</code>
      </pre>
    </div>
  );
}
