import { useSearch } from '../../context/SearchContext';
import { PHASES } from '../../data/phases';
import { LESSONS } from '../../data/lessons';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Difficulty } from '../../types/curriculum';

interface Hit {
  id: string;
  title: string;
  phaseTitle: string;
  type: string;
  difficulty: Difficulty;
}

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

function getDifficultyColor(d: Difficulty): string {
  switch (d) {
    case 'beginner': return 'var(--terminal-green)';
    case 'intermediate': return 'var(--blueprint)';
    case 'advanced': return 'var(--terminal-yellow)';
    case 'expert': return 'var(--terminal-red)';
  }
}

export default function CommandPalette() {
  const { isOpen, closePalette } = useSearch();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Build a flat list of ALL lessons for suggestion mode
  const allLessons = useMemo(() => {
    const hits: Hit[] = [];
    for (const phase of PHASES) {
      for (const lessonId of phase.lessonIds) {
        const lesson = LESSONS[lessonId];
        if (!lesson) continue;
        hits.push({
          id: lesson.id,
          title: lesson.title,
          phaseTitle: phase.title,
          type: lesson.type,
          difficulty: lesson.difficulty,
        });
      }
    }
    return hits;
  }, []);

  // Group by difficulty
  const suggestionsByDifficulty = useMemo(() => {
    const grouped: Record<string, Hit[]> = { beginner: [], intermediate: [], advanced: [], expert: [] };
    for (const l of allLessons) {
      const d = l.difficulty;
      if (grouped[d] && grouped[d].length < 3) {
        grouped[d].push(l);
      }
    }
    return grouped;
  }, [allLessons]);

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allLessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.phaseTitle.toLowerCase().includes(q) ||
      l.difficulty.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [query, allLessons]);

  const results = query.trim() ? searchResults : [];
  const showingSuggestions = !query.trim();

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

  const navigateToLesson = (lessonId: string) => {
    const phase = PHASES.find(p => p.lessonIds.includes(lessonId));
    if (phase) {
      navigate(`/lesson/${phase.id}/${lessonId}`);
      closePalette();
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
      }}
      onClick={e => { if (e.target === e.currentTarget) closePalette(); }}
    >
      <div
        style={{
          maxWidth: 640,
          width: '100%',
          maxHeight: '75vh',
          background: 'var(--modal-bg)',
          border: '2px solid var(--rule)',
          boxShadow: '8px 8px 0 var(--rule)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--rule)',
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
            placeholder="Search 75 lessons..."
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
              border: '1px solid var(--rule)',
              color: 'var(--ink-mute)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {showingSuggestions && (
            <div style={{ padding: '8px 0' }}>
              {DIFFICULTY_ORDER.map(diff => {
                const items = suggestionsByDifficulty[diff];
                if (!items || items.length === 0) return null;
                return (
                  <div key={diff}>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: getDifficultyColor(diff),
                        padding: '8px 16px 4px',
                        fontWeight: 500,
                      }}
                    >
                      {diff}
                    </div>
                    {items.map((item) => (
                      <SuggestionRow key={item.id} item={item} onClick={() => navigateToLesson(item.id)} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Search results */}
          {results.length === 0 && query.trim() && (
            <div style={{ padding: 24, textAlign: 'center', fontFamily: "'Source Serif 4', serif", color: 'var(--ink-mute)', fontSize: '0.9rem' }}>
              No lessons match "{query}"
            </div>
          )}
          {results.map((r, i) => (
            <div
              key={r.id}
              onClick={() => navigateToLesson(r.id)}
              onMouseEnter={() => setSelectedIndex(i)}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 16px',
                borderLeft: `3px solid ${i === selectedIndex ? 'var(--blueprint)' : 'transparent'}`,
                background: i === selectedIndex ? 'var(--blueprint-tint)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: getDifficultyColor(r.difficulty), flexShrink: 0 }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', textTransform: 'uppercase', color: getDifficultyColor(r.difficulty) }}>
                    {r.difficulty}
                  </span>
                  <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.94rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </span>
                </div>
                <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.8rem', color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.phaseTitle}
                </div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.64rem', color: 'var(--ink-mute)', alignSelf: 'center', opacity: i === selectedIndex ? 1 : 0 }}>
                →
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            padding: '8px 16px',
            borderTop: '1px solid var(--rule)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.6rem',
            color: 'var(--ink-mute)',
          }}
        >
          <span><span style={{ border: '1px solid var(--rule)', padding: '1px 4px', background: 'var(--bg-surface)' }}>↑↓</span> Navigate</span>
          <span><span style={{ border: '1px solid var(--rule)', padding: '1px 4px', background: 'var(--bg-surface)' }}>Enter</span> Select</span>
          <span><span style={{ border: '1px solid var(--rule)', padding: '1px 4px', background: 'var(--bg-surface)' }}>ESC</span> Close</span>
        </div>
      </div>
    </div>
  );
}

function SuggestionRow({ item, onClick }: { item: Hit; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 10,
        padding: '6px 16px',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-tint)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </span>
        </div>
        <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.75rem', color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.phaseTitle}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-mute)" strokeWidth="2" style={{ alignSelf: 'center', flexShrink: 0 }}>
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
}
