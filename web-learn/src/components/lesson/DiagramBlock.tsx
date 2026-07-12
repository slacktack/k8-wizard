import React from 'react';

interface DiagramBlockProps {
  lines: string[];
  title?: string;
}

// Box-drawing + arrow glyphs that form the "wiring" of a schematic
const CONNECTOR = /[│─┌┐└┘├┤┬┴┼╭╮╯╰═║╔╗╚╝▸▶◀◆•→←↑↓⟶|+^v<>=]/;

type Run = { kind: 'connector' | 'paren' | 'text'; text: string };

function tokenizeLine(line: string): Run[] {
  const runs: Run[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    // Parenthetical annotation → muted
    if (ch === '(') {
      const close = line.indexOf(')', i);
      const end = close === -1 ? line.length : close + 1;
      runs.push({ kind: 'paren', text: line.slice(i, end) });
      i = end;
      continue;
    }
    const kind: Run['kind'] = CONNECTOR.test(ch) ? 'connector' : 'text';
    let j = i;
    while (j < line.length && line[j] !== '(' && (CONNECTOR.test(line[j]) ? 'connector' : 'text') === kind) {
      j++;
    }
    runs.push({ kind, text: line.slice(i, j) });
    i = j;
  }
  return runs;
}

const RUN_COLOR: Record<Run['kind'], string> = {
  connector: 'var(--blueprint-bright)',
  paren: 'var(--terminal-mute)',
  text: 'var(--terminal-text)',
};

export default function DiagramBlock({ lines, title = 'schematic' }: DiagramBlockProps) {
  const normalized = lines.map(l => l.replace(/\|/g, '│').replace(/-{2,}/g, m => '─'.repeat(m.length)).replace(/->/g, '→'));

  return (
    <figure className="code-block-hover" style={{ margin: '24px 0', width: '100%', maxWidth: '100%' }}>
      <div
        style={{
          border: '1px solid var(--terminal-border)',
          background: 'var(--terminal-bg)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {/* Schematic header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderBottom: '1px solid var(--terminal-chrome-border)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.66rem',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--terminal-mute)',
          }}
        >
          <span style={{ color: 'var(--blueprint-bright)' }}>◇</span>
          {title}
        </div>

        {/* Diagram body — blueprint grid background */}
        <div
          style={{
            padding: '18px 20px',
            overflowX: 'auto',
            backgroundImage:
              'radial-gradient(var(--terminal-grid) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              lineHeight: 1.5,
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <code>
              {normalized.map((line, li) => (
                <React.Fragment key={li}>
                  {tokenizeLine(line).map((run, ri) => (
                    <span
                      key={ri}
                      style={{ color: RUN_COLOR[run.kind], fontWeight: run.kind === 'connector' ? 600 : 400 }}
                    >
                      {run.text}
                    </span>
                  ))}
                  {li < normalized.length - 1 ? '\n' : ''}
                </React.Fragment>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </figure>
  );
}
