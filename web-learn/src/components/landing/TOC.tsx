import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PHASES } from '../../data/phases';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import StatusDot from '../ui/StatusDot';
import { useProgress } from '../../context/ProgressContext';
import { useQuiz } from '../../context/QuizContext';
import AsciiRule from '../ui/AsciiRule';

export default function TOC() {
  const { ref, isVisible } = useScrollReveal(0.05);
  const { isCompleted } = useProgress();
  const { proficiency, overallStats } = useQuiz();
  const navigate = useNavigate();
  const totalLessons = useMemo(() => PHASES.reduce((sum, p) => sum + p.lessonIds.length, 0), []);

  const profColors: Record<string, string> = {
    start: 'var(--terminal-green)',
    intermediate: 'var(--blueprint)',
    advanced: 'var(--terminal-yellow)',
    expert: 'var(--terminal-red)',
  };

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
        <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--blueprint)', marginBottom: 8 }}>
          Curriculum
        </h2>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 24 }}>
          {PHASES.length} Phases · {totalLessons} Lessons · Beginner → Wizard
          {overallStats.total > 0 && (
            <span style={{ fontSize: '0.78rem', marginLeft: 16 }}>
              Proficiency:{' '}
              <span style={{ color: profColors[proficiency], fontWeight: 600 }}>
                {proficiency.charAt(0).toUpperCase() + proficiency.slice(1)}
              </span>
              <span style={{ color: 'var(--ink-mute)', fontSize: '0.7rem', marginLeft: 6 }}>
                ({overallStats.correct}/{overallStats.total} quiz questions)
              </span>
            </span>
          )}
        </p>

        <div style={{ display: 'flex', gap: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 32 }}>
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

        {PHASES.map((phase, i) => {
          const phaseStatus = getPhaseStatus(phase.id);
          const completedCount = phase.lessonIds.filter(id => isCompleted(id)).length;

          return (
            <div
              key={phase.id}
              onClick={() => navigate(`/phase/${phase.id}`)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${phase.title} phase`}
              onKeyDown={e => { if (e.key === 'Enter') navigate(`/phase/${phase.id}`); }}
              className="phase-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 80px minmax(80px, auto)',
                gap: 12,
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid var(--rule)',
                cursor: 'pointer',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.5s ease, transform 0.5s var(--ease-smooth)`,
                transitionDelay: `${i * 0.05}s`,
              }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--blueprint)' }}>
                {String(phase.number).padStart(2, '0')}
              </span>

              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', color: 'var(--ink)', fontWeight: 500 }}>
                {phase.title}
              </span>

              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--ink-mute)', textAlign: 'right', minWidth: 48, fontVariantNumeric: 'tabular-nums' }}>
                {completedCount}/{phase.lessonIds.length}
              </span>

              <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                {phase.lessonIds.map((id, j) => {
                  const dotStatus = isCompleted(id) ? 'complete' : phaseStatus === 'in-progress' && j <= completedCount ? 'in-progress' : 'planned';
                  return (
                    <StatusDot key={id} status={dotStatus} size={10} />
                  );
                })}
              </div>
            </div>
          );
        })}

        <AsciiRule />
      </div>
    </section>
  );
}
