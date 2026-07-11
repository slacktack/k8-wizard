import CopyButton from '../ui/CopyButton';

interface CommandBlockProps {
  prompt: string;
  cmd: string;
  output?: string;
}

export default function CommandBlock({ prompt, cmd, output }: CommandBlockProps) {
  return (
    <div
      style={{
        margin: '24px 0',
        border: '1px solid var(--terminal-border)',
        background: 'var(--terminal-bg)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Terminal Chrome */}
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
      </div>

      {/* Command */}
      <div style={{ padding: '12px 16px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <CopyButton text={`${prompt} ${cmd}`} />
        </div>
        <code
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--terminal-text)',
            display: 'block',
            marginBottom: output ? 8 : 0,
            width: '100%',
            maxWidth: '100%',
            overflowWrap: 'break-word',
          }}
        >
          <span style={{ color: 'var(--terminal-mute)' }}>{prompt} </span>
          <span>{cmd}</span>
        </code>
        {output && (
          <pre
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              lineHeight: 1.5,
              color: 'var(--terminal-green)',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
