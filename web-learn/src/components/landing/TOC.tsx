import { useState, useEffect } from 'react';
import { PHASES } from '../../data/phases';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import StatusDot from '../ui/StatusDot';
import { useProgress } from '../../context/ProgressContext';
import AsciiRule from '../ui/AsciiRule';
import PhaseModal from '../modal/PhaseModal';

export default function TOC() {
  const { ref, isVisible } = useScrollReveal(0.05);
  const { isCompleted } = useProgress();
  const [activePhase, setActivePhase] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setActivePhase(null);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  function getPhaseStatus(phaseId: string) {
    const phase = PHASES.find(p => p.id === phaseId);
    if (!phase) return 'planned';
    const allDone = phase.lessonIds.every(id => isCompleted(id));
    const anyDone = phase.lessonIds.some(id => isCompleted(id));
    if (allDone) return 'complete';
    if (anyDone) return 'in-progress';
    return 'planned';
  }

  return (
    <section className="section-padding" id="curriculum">
      <div className="container" ref={ref}>
        {/* Section Header */}
        <h2
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            color: 'var(--blueprint)',
            marginBottom: 8,
          }}
        >
          Curriculum
        </h2>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.85rem',
            color: 'var(--ink-mute)',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          8 Phases · 58 Lessons · Beginner → Wizard
        </p>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot status="complete" /> Complete
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot status="in-progress" /> In Progress
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot status="planned" /> Planned
          </span>
        </div>

        {/* Phase Rows */}
        {PHASES.map((phase, i) => {
          const phaseStatus = getPhaseStatus(phase.id);
          const completedCount = phase.lessonIds.filter(id => isCompleted(id)).length;

          return (
            <div
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${phase.title} phase`}
              onKeyDown={e => { if (e.key === 'Enter') setActivePhase(phase.id); }}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 80px 100px',
                gap: 16,
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid var(--rule-soft)',
                cursor: 'pointer',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)`,
                transitionDelay: `${i * 0.06}s`,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--blueprint-tint)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Phase Number */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.78rem',
                  color: 'var(--blueprint)',
                }}
              >
                {String(phase.number).padStart(2, '0')}
              </span>

              {/* Title */}
              <span
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                  color: 'var(--ink)',
                }}
              >
                {phase.title}
              </span>

              {/* Lesson Count */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  color: 'var(--ink-mute)',
                  textAlign: 'right',
                }}
              >
                {completedCount}/{phase.lessonIds.length}
              </span>

              {/* Status Dots */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                {phase.lessonIds.map((id, j) => (
                  <StatusDot
                    key={id}
                    status={
                      isCompleted(id)
                        ? 'complete'
                        : phaseStatus === 'in-progress' && j <= completedCount
                        ? 'in-progress'
                        : 'planned'
                    }
                    size={10}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <AsciiRule />

        {/* Phase Modal */}
        {activePhase && (
          <PhaseModal phaseId={activePhase} onClose={() => setActivePhase(null)} />
        )}
      </div>
    </section>
  );
}
