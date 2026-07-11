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
        // Cursor fades 2s after all lines complete
        totalTimer = setTimeout(() => setCursorVisible(false), 2000);
        return;
      }

      setVisibleLines(idx + 1);

      const line = lines[idx];
      if (line.cmd) {
        // Typing animation
        const cmdLen = line.cmd.length;
        let charIdx = 0;
        const charTimer = setInterval(() => {
          charIdx++;
          setTypedChars(prev => ({ ...prev, [idx]: charIdx }));
          if (charIdx >= cmdLen) {
            clearInterval(charTimer);
            // Output appears after 400ms "execution" delay
            if (line.output) {
              setTimeout(() => {
                setOutputLines(prev => ({ ...prev, [idx]: true }));
              }, 400);
            }
            // Next line after some delay
            setTimeout(() => processLine(idx + 1), line.output ? 600 : 300);
          }
        }, typingSpeed);
      } else {
        // Non-input lines appear instantly with stagger
        setTimeout(() => {
          setOutputLines(prev => ({ ...prev, [idx]: true }));
        }, 80 * idx);
        setTimeout(() => processLine(idx + 1), 150);
      }
    }

    processLine(0);

    return () => clearTimeout(totalTimer);
  }, [lines, typingSpeed]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [visibleLines, typedChars, outputLines]);

  return (
    <div className={`terminal-window ${className}`} style={{ border: '1px solid var(--rule)', background: 'var(--terminal-bg)', overflow: 'hidden' }}>
      {/* Chrome */}
      <div style={{ height: 28, background: 'var(--terminal-chrome-bg)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, position: 'relative' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', border: '1px solid rgba(0,0,0,0.1)', transition: 'transform 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', border: '1px solid rgba(0,0,0,0.1)', transition: 'transform 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', border: '1px solid rgba(0,0,0,0.1)', transition: 'transform 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--terminal-chrome-text)' }}>
          {title}
        </span>
        <div style={{ flex: 1 }} />
      </div>

      {/* Body */}
      <div ref={bodyRef} style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--terminal-text)', maxHeight: 500, overflowY: 'auto', position: 'relative', borderLeft: '1px solid var(--rule)', borderRight: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <CopyButton text={lines.filter(l => l.cmd).map(l => (l.prompt || '') + l.cmd).join('\n')} />
        </div>

        {lines.slice(0, visibleLines).map((line, i) => {
          const isComplete = typedChars[i] !== undefined ? typedChars[i] >= (line.cmd?.length || 0) : true;
          return (
            <div key={i} className={outputLines[i] ? 'terminal-output-line' : ''} style={{ marginBottom: 4, minHeight: '1.5em' }}>
              {line.cmd ? (
                <>
                  <span style={{ color: 'var(--terminal-mute)' }}>{line.prompt || 'k8s-master:~$ '}</span>
                  <span style={{ color: 'var(--terminal-text)' }}>
                    {line.cmd.split('').slice(0, typedChars[i] || line.cmd.length).join('')}
                  </span>
                  {isComplete && i === visibleLines - 1 && cursorVisible && (
                    <span style={{ display: 'inline-block', width: 8, height: '1.2em', background: 'var(--blueprint)', verticalAlign: 'text-bottom', animation: 'cursor-blink 1s step-end infinite', marginLeft: 2 }} />
                  )}
                  {!isComplete && (
                    <span style={{ display: 'inline-block', width: 8, height: '1.2em', background: 'var(--blueprint)', verticalAlign: 'text-bottom', animation: 'cursor-blink 1s step-end infinite', marginLeft: 2 }} />
                  )}
                </>
              ) : line.output ? (
                <span style={{ color: line.type === 'success' ? 'var(--terminal-green)' : line.type === 'error' ? 'var(--terminal-red)' : 'var(--terminal-text)' }}>
                  {line.type === 'success' ? '✓ ' : line.type === 'error' ? '✗ ' : ''}{line.output}
                </span>
              ) : null}
            </div>
          );
        })}

        {children}
      </div>
    </div>
  );
}
