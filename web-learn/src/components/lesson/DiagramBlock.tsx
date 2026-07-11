interface DiagramBlockProps {
  lines: string[];
}

export default function DiagramBlock({ lines }: DiagramBlockProps) {
  return (
    <div
      style={{
        margin: '16px 0',
        padding: '16px',
        background: 'var(--code-bg)',
        border: '1px solid var(--rule-soft)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        lineHeight: 1.4,
        overflowX: 'auto',
      }}
    >
      <pre style={{ margin: 0, color: 'var(--ink)' }}>
        <code>{lines.map(l => l.replace(/\|/g, '│').replace(/-/g, '─')).join('\n')}</code>
      </pre>
    </div>
  );
}
