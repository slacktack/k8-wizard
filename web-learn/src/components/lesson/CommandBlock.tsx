import CopyButton from '../ui/CopyButton';
import { highlight } from '../../utils/highlight';

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
      className="code-block-hover"
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
            display: 'block',
            marginBottom: output ? 10 : 0,
            width: '100%',
            maxWidth: '100%',
            overflowWrap: 'break-word',
          }}
        >
          {/* Input: bright green prompt + highlighted command */}
          <span style={{ color: 'var(--terminal-green)', fontWeight: 600, userSelect: 'none' }}>{prompt} </span>
          <span style={{ color: 'var(--terminal-text)', fontWeight: 500 }}>{highlight(cmd, 'bash')}</span>
        </code>
        {output && (
          <pre
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              lineHeight: 1.5,
              color: 'var(--terminal-output)',
              margin: 0,
              marginLeft: 4,
              paddingLeft: 12,
              borderLeft: '2px solid var(--terminal-chrome-border)',
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
