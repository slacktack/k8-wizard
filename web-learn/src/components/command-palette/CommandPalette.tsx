import { useSearch } from '../../context/SearchContext';
import { PHASES } from '../../data/phases';
import { LESSONS } from '../../data/lessons';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette() {
  const { isOpen, closePalette } = useSearch();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const hits: { id: string; title: string; phaseTitle: string; type: string }[] = [];

    for (const phase of PHASES) {
      for (const lessonId of phase.lessonIds) {
        const lesson = LESSONS[lessonId];
        if (!lesson) continue;
        if (
          lesson.title.toLowerCase().includes(q) ||
          phase.title.toLowerCase().includes(q)
        ) {
          hits.push({
            id: lesson.id,
            title: lesson.title,
            phaseTitle: phase.title,
            type: lesson.type,
          });
        }
      }
    }
    return hits.slice(0, 20);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      const phase = PHASES.find(p => p.lessonIds.includes(results[selectedIndex].id));
      if (phase) {
        navigate(`/lesson/${phase.id}/${results[selectedIndex].id}`);
        closePalette();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        paddingTop: 'clamp(68px, 13vh, 150px)',
        background: 'var(--overlay-bg)',
        display: 'flex',
        justifyContent: 'center',
        transition: 'opacity 0.15s',
      }}
      onClick={e => { if (e.target === e.currentTarget) closePalette(); }}
    >
      <div
        style={{
          maxWidth: 640,
          width: '100%',
          maxHeight: '70vh',
          background: 'var(--modal-bg)',
          border: '2px solid var(--ink)',
          boxShadow: 'var(--shadow-palette)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'paletteEntry 0.16s ease',
        }}
      >
        <style>{`
          @keyframes paletteEntry {
            from { opacity: 0; transform: translateY(-12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--rule-soft)',
            alignItems: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-mute)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search lessons..."
            style={{
              flex: 1,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1rem',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--ink)',
              caretColor: 'var(--blueprint)',
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem',
              padding: '2px 6px',
              border: '1px solid var(--rule-soft)',
              color: 'var(--ink-mute)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          {results.length === 0 && query.trim() && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                fontFamily: "'Source Serif 4', serif",
                color: 'var(--ink-mute)',
                fontSize: '0.9rem',
              }}
            >
              No lessons match "{query}"
            </div>
          )}
          {results.map((r, i) => (
            <div
              key={r.id}
              onClick={() => {
                const phase = PHASES.find(p => p.lessonIds.includes(r.id));
                if (phase) {
                  navigate(`/lesson/${phase.id}/${r.id}`);
                  closePalette();
                }
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 16px',
                borderLeft: `3px solid ${i === selectedIndex ? 'var(--blueprint)' : 'transparent'}`,
                background: i === selectedIndex ? 'var(--blueprint-tint)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      color: 'var(--blueprint)',
                    }}
                  >
                    {r.type}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontSize: '0.94rem',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.title}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontSize: '0.8rem',
                    color: 'var(--ink-soft)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.phaseTitle}
                </div>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.64rem',
                  color: 'var(--ink-mute)',
                  alignSelf: 'center',
                  opacity: i === selectedIndex ? 1 : 0,
                  transition: 'opacity 0.1s',
                }}
              >
                →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
