import { useState, useEffect, useRef } from 'react';
import CopyButton from '../ui/CopyButton';
import { highlight } from '../../utils/highlight';

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
  const [cursorVisible, setCursorVisible] = useState(true);
  const [outputLines, setOutputLines] = useState<Record<number, boolean>>({});
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lines.length === 0) return;
    setVisibleLines(0);
    setTypedChars({});
    setOutputLines({});
    setCursorVisible(true);

    let totalTimer: ReturnType<typeof setTimeout>;

    function processLine(idx: number) {
      if (idx >= lines.length) {
        totalTimer = setTimeout(() => setCursorVisible(false), 2000);
        return;
      }
      setVisibleLines(idx + 1);
      const line = lines[idx];
      if (line.cmd) {
        const cmdLen = line.cmd.length;
        let charIdx = 0;
        const charTimer = setInterval(() => {
          charIdx++;
          setTypedChars(prev => ({ ...prev, [idx]: charIdx }));
          if (charIdx >= cmdLen) {
            clearInterval(charTimer);
            if (line.output) setTimeout(() => setOutputLines(prev => ({ ...prev, [idx]: true })), 400);
            setTimeout(() => processLine(idx + 1), line.output ? 600 : 300);
          }
        }, typingSpeed);
      } else {
        setTimeout(() => setOutputLines(prev => ({ ...prev, [idx]: true })), 80 * idx);
        setTimeout(() => processLine(idx + 1), 150);
      }
    }
    processLine(0);
    return () => clearTimeout(totalTimer);
  }, [lines, typingSpeed]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [visibleLines, typedChars, outputLines]);

  return (
    <div className={`code-block-hover terminal-window ${className}`} style={{ border: '1px solid var(--terminal-border)', background: 'var(--terminal-bg)', overflow: 'hidden' }}>
      {/* Chrome — glass-like */}
      <div style={{ height: 30, background: 'var(--terminal-glass)', borderBottom: '1px solid var(--terminal-chrome-border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, position: 'relative' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', border: '1px solid rgba(0,0,0,0.12)', transition: 'transform 0.15s, filter 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.filter = 'brightness(1.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
        />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', border: '1px solid rgba(0,0,0,0.12)', transition: 'transform 0.15s, filter 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.filter = 'brightness(1.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
        />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', border: '1px solid rgba(0,0,0,0.12)', transition: 'transform 0.15s, filter 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.filter = 'brightness(1.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
        />
        <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--terminal-chrome-text)', opacity: 0.8 }}>
          {title}
        </span>
        <div style={{ flex: 1 }} />
      </div>

      {/* Body */}
      <div ref={bodyRef} style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--terminal-text)', maxHeight: 500, overflowY: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <CopyButton text={lines.filter(l => l.cmd).map(l => (l.prompt || '') + l.cmd).join('\n')} />
        </div>
        {lines.slice(0, visibleLines).map((line, i) => {
          const cmdLen = line.cmd?.length || 0;
          const shownChars = typedChars[i] !== undefined ? typedChars[i] : cmdLen;
          const isComplete = shownChars >= cmdLen;
          if (line.cmd) {
            const shownCmd = line.cmd.slice(0, shownChars);
            return (
              <div key={i} style={{ marginBottom: 6, minHeight: '1.5em' }}>
                {/* Input: green prompt + bright, highlighted command */}
                <span style={{ color: 'var(--terminal-green)', fontWeight: 600, userSelect: 'none' }}>
                  {line.prompt || 'k8s-master:~$ '}
                </span>
                <span style={{ color: 'var(--terminal-text)', fontWeight: 500 }}>
                  {isComplete ? highlight(line.cmd, 'bash') : shownCmd}
                </span>
                {(isComplete ? i === visibleLines - 1 && cursorVisible : true) && (
                  <span style={{ display: 'inline-block', width: 8, height: '1.2em', background: 'var(--blueprint)', verticalAlign: 'text-bottom', animation: 'cursor-blink 1s step-end infinite', marginLeft: 2, opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.3s' }} />
                )}
              </div>
            );
          }
          if (line.output) {
            // Output: visually recessed, grouped under its command by a left accent bar
            const outColor = line.type === 'success' ? 'var(--terminal-green)' : line.type === 'error' ? 'var(--terminal-red)' : 'var(--terminal-output)';
            const accent = line.type === 'error' ? 'rgba(255,95,86,0.4)' : line.type === 'success' ? 'rgba(63,185,80,0.4)' : 'var(--terminal-chrome-border)';
            return (
              <div
                key={i}
                className={outputLines[i] ? 'terminal-output-line' : ''}
                style={{
                  marginBottom: 10,
                  marginLeft: 4,
                  paddingLeft: 12,
                  borderLeft: `2px solid ${accent}`,
                  color: outColor,
                  whiteSpace: 'pre-wrap',
                  opacity: outputLines[i] ? 0.92 : 0,
                  transition: 'opacity 0.2s',
                }}
              >
                {line.type === 'error' ? '! ' : ''}{line.output}
              </div>
            );
          }
          return null;
        })}
        {children}
      </div>

      {/* Custom scrollbar */}
      <style>{`
        .terminal-window ::-webkit-scrollbar { width: 4px; height: 4px; }
        .terminal-window ::-webkit-scrollbar-track { background: transparent; }
        .terminal-window ::-webkit-scrollbar-thumb { background: var(--terminal-scrollbar); border-radius: 2px; }
        .terminal-window ::-webkit-scrollbar-thumb:hover { background: var(--terminal-mute); }
      `}</style>
    </div>
  );
}
