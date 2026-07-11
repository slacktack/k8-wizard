import CopyButton from '../ui/CopyButton';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code }: CodeBlockProps) {
  return (
    <div
      style={{
        margin: '16px 0',
        background: 'var(--code-bg)',
        border: '1px solid var(--rule-soft)',
        padding: '12px 16px',
        position: 'relative',
        overflowX: 'auto',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      <div style={{ position: 'absolute', top: 8, right: 8 }}>
        <CopyButton text={code} />
      </div>
      <pre style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, width: '100%', maxWidth: '100%' }}>
        <code style={{ width: '100%', maxWidth: '100%' }}>{code}</code>
      </pre>
    </div>
  );
}
