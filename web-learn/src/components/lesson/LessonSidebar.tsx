import type { Lesson, Phase, LessonSection } from '../../types/curriculum';
import UMLDiagram, { DOCKER_BUILD_UML } from '../tui/UMLDiagram';
import { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { showProgressToast } from '../ui/ProgressToast';

interface LessonSidebarProps {
  lesson: Lesson;
  phase: Phase;
  lessonIndex: number;
}

export default function LessonSidebar({ lesson, phase, lessonIndex }: LessonSidebarProps) {
  const { isCompleted, toggleLesson } = useProgress();
  const [activeTab, setActiveTab] = useState<'analogy' | 'layers'>('analogy');

  const totalInPhase = phase.lessonIds.length;
  const pct = Math.round(((lessonIndex + 1) / totalInPhase) * 100);

  // Extract takeaways from note sections
  const takeaways = lesson.sections.filter(s => s.type === 'note').map(s => (s as LessonSection & { type: 'note' }).body);

  // Extract key concepts from the first concept table
  const conceptTable = lesson.sections.find(s => s.type === 'table') as LessonSection & { type: 'table' } | undefined;

  // Check if this lesson has a docker-build UML
  const hasUml = lesson.sections.some(s => s.type === 'uml');

  // Check for layered diagram
  const layersDiagram = lesson.sections.find((s): s is LessonSection & { type: 'diagram'; lines: string[] } =>
    s.type === 'diagram' && s.lines.some(l => l.includes('Container') && l.includes('writable'))
  );

  return (
    <aside
      className="lesson-sidebar"
      style={{
        position: 'sticky',
        top: 88,
        alignSelf: 'start',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        minWidth: 0,
        paddingTop: 28,
      }}
    >
      {/* Summary Card */}
      <SidebarCard title="Summary">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', lineHeight: 1.8 }}>
          <SummaryRow label="Phase" value={`${phase.number}. ${phase.title}`} />
          <SummaryRow label="Lesson" value={`${lesson.number} of ${totalInPhase}`} />
          <SummaryRow label="Duration" value={lesson.duration} />
          <SummaryRow label="Type" value={lesson.type} color={lesson.type === 'capstone' ? 'var(--warn)' : lesson.type === 'build' ? 'var(--blueprint)' : 'var(--ink)'} />
          <SummaryRow label="Difficulty" value={lesson.difficulty} color={
            lesson.difficulty === 'beginner' ? 'var(--terminal-green)' :
            lesson.difficulty === 'intermediate' ? 'var(--blueprint)' :
            lesson.difficulty === 'advanced' ? 'var(--terminal-yellow)' : 'var(--terminal-red)'
          } />
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--ink-mute)', marginBottom: 4 }}>
            <span>Progress</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--rule-soft)' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--blueprint)', transition: 'width 0.4s ease' }} />
          </div>
        </div>
        <button
          onClick={() => {
            const wasCompleted = isCompleted(lesson.id);
            toggleLesson(lesson.id);
            if (!wasCompleted) {
              const nextIdx = lessonIndex + 1;
              const nextId = nextIdx < phase.lessonIds.length ? phase.lessonIds[nextIdx] : null;
              if (nextId) {
                showProgressToast(lesson.title, `/lesson/${phase.id}/${nextId}`);
              }
            }
          }}
          style={{
            marginTop: 12,
            width: '100%',
            padding: '8px 0',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            border: `1px solid ${isCompleted(lesson.id) ? 'var(--blueprint)' : 'var(--rule)'}`,
            background: isCompleted(lesson.id) ? 'var(--blueprint)' : 'transparent',
            color: isCompleted(lesson.id) ? 'var(--bg)' : 'var(--ink)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!isCompleted(lesson.id)) { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.color = 'var(--blueprint)'; }}}
          onMouseLeave={e => { if (!isCompleted(lesson.id)) { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink)'; }}}
        >
          {isCompleted(lesson.id) ? '✓ Completed' : 'Mark Complete'}
        </button>
      </SidebarCard>

      {/* Key Concepts Card */}
      {conceptTable && (
        <SidebarCard title="Key Concepts">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}>
            {conceptTable.rows.slice(0, 4).map(row => (
              <div
                key={row[0]}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid var(--rule-soft)',
                  cursor: 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-tint)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ color: 'var(--blueprint)', fontWeight: 500, marginBottom: 2 }}>{row[0]}</div>
                <div style={{ color: 'var(--ink-soft)', fontSize: '0.68rem', lineHeight: 1.4 }}>{row[1]}</div>
              </div>
            ))}
          </div>
        </SidebarCard>
      )}

      {/* Diagram/Analogy Card */}
      {hasUml && (
        <SidebarCard title="Architecture">
          <div style={{ display: 'flex', gap: 0, marginBottom: 12, borderBottom: '1px solid var(--rule-soft)' }}>
            <TabButton active={activeTab === 'analogy'} onClick={() => setActiveTab('analogy')}>Build Flow</TabButton>
            {layersDiagram && <TabButton active={activeTab === 'layers'} onClick={() => setActiveTab('layers')}>Layers</TabButton>}
          </div>
          {activeTab === 'analogy' && (
            <UMLDiagram nodes={DOCKER_BUILD_UML} />
          )}
          {activeTab === 'layers' && layersDiagram && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                lineHeight: 1.3,
                color: 'var(--terminal-text)',
                background: 'var(--terminal-bg)',
                padding: 12,
                overflowX: 'auto',
                whiteSpace: 'pre',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                maxWidth: '100%',
                width: '100%',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.opacity = '1'; }}
              onClick={e => {
                const el = e.currentTarget;
                el.style.opacity = '0.7';
                setTimeout(() => el.style.opacity = '1', 300);
              }}
            >
              {layersDiagram && layersDiagram.type === 'diagram' ? layersDiagram.lines.join('\n') : ''}
            </div>
          )}
        </SidebarCard>
      )}

      {/* Takeaways Card */}
      {takeaways.length > 0 && (
        <SidebarCard title="Key Takeaways">
          {takeaways.map((t, i) => (
            <div
              key={i}
              style={{
                padding: '8px 10px',
                marginBottom: 6,
                borderLeft: '2px solid var(--blueprint)',
                background: 'var(--blueprint-tint)',
                fontFamily: "'Source Serif 4', serif",
                fontSize: '0.78rem',
                lineHeight: 1.5,
                color: 'var(--ink-soft)',
              }}
            >
              {t}
            </div>
          ))}
        </SidebarCard>
      )}

      {/* Commands Card */}
      {lesson.commands && lesson.commands.length > 0 && (
        <SidebarCard title="Commands in This Lesson">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', lineHeight: 1.8 }}>
            {lesson.commands.map(cmd => (
              <div key={cmd} style={{ color: 'var(--ink-soft)', padding: '1px 0' }}>
                <span style={{ color: 'var(--terminal-mute)' }}>$ </span>{cmd}
              </div>
            ))}
          </div>
        </SidebarCard>
      )}
    </aside>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ border: '1px solid var(--rule)', background: 'var(--bg-elevated)', transition: 'border-color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blueprint)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '12px 16px',
          borderBottom: collapsed ? 'none' : '1px solid var(--rule-soft)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.68rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--blueprint)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-tint)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--ink-mute)', transition: 'transform 0.2s var(--ease-snappy)', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
      </div>
      <div className={`sidebar-card-body ${collapsed ? 'closed' : 'open'}`}>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, marginBottom: 2 }}>
      <span style={{ color: 'var(--ink-mute)', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ color: color || 'var(--ink)', fontWeight: 500, fontSize: '0.72rem' }}>{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '6px 12px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        border: 'none',
        borderBottom: active ? '2px solid var(--blueprint)' : '2px solid transparent',
        background: 'transparent',
        color: active ? 'var(--blueprint)' : 'var(--ink-mute)',
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {children}
    </button>
  );
}
