import CopyButton from '../ui/CopyButton';
import { highlight, detectLang } from '../../utils/highlight';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const lang = detectLang(code, language);
  const label = lang === 'text' ? 'code' : lang;

  return (
    <div
      className="code-block-hover"
      style={{
        margin: '16px 0',
        background: 'var(--terminal-bg)',
        border: '1px solid var(--terminal-border)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Language chip + copy */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px 6px 14px',
          borderBottom: '1px solid var(--terminal-chrome-border)',
          background: 'var(--terminal-glass)',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.66rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--terminal-cyan)',
          }}
        >
          {label}
        </span>
        <CopyButton text={code} />
      </div>

      <pre
        style={{
          margin: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.82rem',
          lineHeight: 1.6,
          color: 'var(--terminal-text)',
          padding: '14px 18px',
          overflowX: 'auto',
          width: '100%',
          maxWidth: '100%',
          tabSize: 2,
        }}
      >
        <code>{highlight(code, lang)}</code>
      </pre>
    </div>
  );
}
