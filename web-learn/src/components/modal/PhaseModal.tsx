import { useEffect, useRef } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { PHASES } from '../../data/phases';
import { LESSONS } from '../../data/lessons';
import type { Lesson } from '../../types/curriculum';
import LessonRow from './LessonRow';

interface PhaseModalProps {
  phaseId: string;
  onClose: () => void;
}

export default function PhaseModal({ phaseId, onClose }: PhaseModalProps) {
  const phase = PHASES.find(p => p.id === phaseId);
  if (!phase) return null;

  const lessons = phase.lessonIds.map(id => LESSONS[id]).filter(Boolean);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--overlay-bg)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'clamp(68px, 13vh, 150px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <ModalPanel phase={phase} lessons={lessons} onClose={onClose} />
    </div>
  );
}

function ModalPanel({ phase, lessons, onClose }: { phase: typeof PHASES[0]; lessons: Lesson[]; onClose: () => void }) {
  const { isCompleted, toggleLesson } = useProgress();
  const panelRef = useRef<HTMLDivElement>(null);

  const completed = lessons.filter(l => isCompleted(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      style={{
        maxWidth: 760,
        width: '100%',
        maxHeight: '86vh',
        overflowY: 'auto',
        background: 'var(--modal-bg)',
        border: '1px solid var(--ink)',
        padding: '36px 32px 28px',
        animation: 'modalEntry 0.25s ease',
      }}
    >
      <style>{`
        @keyframes modalEntry {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--blueprint)', textTransform: 'uppercase', marginBottom: 4 }}>
        Phase {phase.number}
      </p>
      <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '1.8rem', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 8 }}>
        {phase.title}
      </h2>
      <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.95rem', color: 'var(--ink-soft)', marginBottom: 20, lineHeight: 1.6 }}>
        {phase.description}
      </p>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--blueprint)', background: 'var(--blueprint-tint)', padding: '4px 10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 16, fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ minWidth: 28, textAlign: 'right' }}>{completed}</span>/{lessons.length} <span style={{ minWidth: 32 }}>· {pct}%</span>
      </div>

      <div style={{ height: 4, background: 'var(--rule-soft)', marginBottom: 24 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--blueprint)', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lessons.map(lesson => (
          <LessonRow key={lesson.id} lesson={lesson} isCompleted={isCompleted(lesson.id)} onToggle={() => toggleLesson(lesson.id)} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--rule-soft)' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--ink-mute)' }}>Progress saved locally</span>
        <button onClick={onClose} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', padding: '6px 14px', border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint)'; e.currentTarget.style.color = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--blueprint)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--ink)'; }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
