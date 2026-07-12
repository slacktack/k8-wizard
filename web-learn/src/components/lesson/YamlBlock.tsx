import CopyButton from '../ui/CopyButton';
import { highlight } from '../../utils/highlight';

interface YamlBlockProps {
  filename: string;
  code: string;
}

export default function YamlBlock({ filename, code }: YamlBlockProps) {
  const lineCount = code.replace(/\n$/, '').split('\n').length;

  return (
    <figure style={{ margin: '24px 0', width: '100%', maxWidth: '100%' }} className="code-block-hover">
      <div
        style={{
          border: '1px solid var(--terminal-border)',
          background: 'var(--terminal-bg)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {/* Chrome — glass gradient, matches TerminalWindow */}
        <div
          style={{
            height: 30,
            background: 'var(--terminal-glass)',
            borderBottom: '1px solid var(--terminal-chrome-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 8,
            position: 'relative',
          }}
        >
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f56' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#27c93f' }} />
          <span
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              color: 'var(--terminal-mute)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ color: 'var(--terminal-cyan)', opacity: 0.9 }}>▪</span>
            {filename}
          </span>
        </div>

        {/* Code with line-number gutter */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <CopyButton text={code} />
          </div>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            <div
              aria-hidden
              style={{
                flexShrink: 0,
                userSelect: 'none',
                textAlign: 'right',
                padding: '14px 12px 14px 16px',
                borderRight: '1px solid var(--terminal-chrome-border)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: 'var(--terminal-mute)',
                opacity: 0.45,
              }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.82rem',
                lineHeight: 1.6,
                color: 'var(--terminal-text)',
                padding: '14px 18px',
                margin: 0,
                width: '100%',
                tabSize: 2,
              }}
            >
              <code>{highlight(code, 'yaml')}</code>
            </pre>
          </div>
        </div>
      </div>
    </figure>
  );
}
