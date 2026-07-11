import { useState, useEffect, useRef } from 'react';
import CopyButton from '../ui/CopyButton';

interface TerminalLine {
  prompt?: string;
  cmd?: string;
  output?: string;
  type?: 'input' | 'output' | 'success' | 'error';
}

interface TerminalWindowProps {
  title?: string;
  lines: TerminalLine[];
  typingSpeed?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function TerminalWindow({ title = 'terminal — 80×24', lines = [], typingSpeed = 30, className = '', children }: TerminalWindowProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<Record<number, number>>({});
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lines.length === 0) return;
    setVisibleLines(0);
    setTypedChars({});

    let lineIdx = 0;
    const lineTimer = setInterval(() => {
      if (lineIdx < lines.length) {
        setVisibleLines(lineIdx + 1);
        // Start typing animation for input lines
        if (lines[lineIdx].cmd) {
          const cmdLen = lines[lineIdx].cmd!.length;
          let charIdx = 0;
          const charTimer = setInterval(() => {
            charIdx++;
            setTypedChars(prev => ({ ...prev, [lineIdx]: charIdx }));
            if (charIdx >= cmdLen) clearInterval(charTimer);
          }, typingSpeed);
        }
        lineIdx++;
      } else {
        clearInterval(lineTimer);
      }
    }, lines.some(l => l.cmd) ? 400 : 150);

    return () => clearInterval(lineTimer);
  }, [lines, typingSpeed]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [visibleLines, typedChars]);

  return (
    <div className={`terminal-window ${className}`} style={{ border: '1px solid var(--terminal-border)', background: 'var(--terminal-bg)', overflow: 'hidden' }}>
      {/* Chrome */}
      <div style={{ height: 28, background: 'var(--terminal-chrome-bg)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, position: 'relative' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', border: '1px solid rgba(0,0,0,0.06)' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', border: '1px solid rgba(0,0,0,0.06)' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', border: '1px solid rgba(0,0,0,0.06)' }} />
        <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--terminal-chrome-text)' }}>
          {title}
        </span>
        <div style={{ flex: 1 }} />
      </div>

      {/* Body */}
      <div ref={bodyRef} style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--terminal-text)', maxHeight: 400, overflowY: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <CopyButton text={lines.map(l => l.cmd || l.output || '').join('\n')} />
        </div>

        {lines.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ marginBottom: 4, minHeight: '1.5em' }}>
            {line.type === 'input' || line.cmd ? (
              <>
                <span style={{ color: 'var(--terminal-mute)' }}>{line.prompt || 'minime % '}</span>
                {line.cmd && (
                  <span>
                    {line.cmd.split('').slice(0, typedChars[i] || line.cmd.length).join('')}
                    {(typedChars[i] || line.cmd.length) < line.cmd.length && (
                      <span className="cursor-blink" style={{ display: 'inline-block', width: 8, height: '1.2em', background: 'var(--terminal-cyan)', verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite' }} />
                    )}
                  </span>
                )}
              </>
            ) : line.type === 'success' ? (
              <span style={{ color: 'var(--terminal-green)' }}>✓ {line.output || line.cmd}</span>
            ) : line.type === 'error' ? (
              <span style={{ color: 'var(--terminal-red)' }}>✗ {line.output || line.cmd}</span>
            ) : (
              <span style={{ color: line.output?.startsWith('NAME') ? 'var(--terminal-cyan)' : 'var(--terminal-text)' }}>
                {line.output || line.cmd}
              </span>
            )}
          </div>
        ))}

        {visibleLines < lines.length && (
          <span className="cursor-blink" style={{ display: 'inline-block', width: 8, height: '1.2em', background: 'var(--terminal-cyan)', verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite' }} />
        )}

        {children}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
