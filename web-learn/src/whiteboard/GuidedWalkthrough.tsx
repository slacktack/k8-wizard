import { useState, useCallback } from 'react';
import { useEditor } from './store';
import { TUTORIALS, type Tutorial } from './tutorials';

interface GuidedWalkthroughProps {
  onClose: () => void;
}

export default function GuidedWalkthrough({ onClose }: GuidedWalkthroughProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const setElements = useEditor(s => s.setElements);

  const startTutorial = useCallback((t: Tutorial) => {
    setSelectedTutorial(t);
    setCurrentStep(0);
    // Set first step elements
    setElements(t.steps[0].elements);
  }, [setElements]);

  const goToStep = useCallback((stepIdx: number) => {
    if (!selectedTutorial) return;
    setCurrentStep(stepIdx);
    setElements(selectedTutorial.steps[stepIdx].elements);
  }, [selectedTutorial, setElements]);

  // Tutorial list view
  if (!selectedTutorial) {
    return (
      <OverlayPanel onClose={onClose} title="Guided Tutorials">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-mute)', marginBottom: 16 }}>
          Step through real system design architectures. Each step adds components to the canvas.
        </div>
        {TUTORIALS.map(t => (
          <button
            key={t.id}
            onClick={() => startTutorial(t)}
            style={cardStyle}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.background = 'var(--blueprint-tint)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule-soft)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.name}</span>
              <DifficultyBadge difficulty={t.difficulty} />
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--ink-soft)', lineHeight: 1.4, textAlign: 'left' }}>
              {t.description}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--ink-mute)', marginTop: 6 }}>
              {t.steps.length} steps
            </div>
          </button>
        ))}
      </OverlayPanel>
    );
  }

  const step = selectedTutorial.steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === selectedTutorial.steps.length - 1;

  return (
    <OverlayPanel
      onClose={onClose}
      title={`${selectedTutorial.name} — Step ${currentStep + 1}/${selectedTutorial.steps.length}`}
    >
      <div style={{ marginBottom: 16 }}>
        {/* Step progress bar */}
        <div style={{ height: 4, background: 'var(--rule-soft)', marginBottom: 16 }}>
          <div style={{
            height: '100%',
            width: `${((currentStep + 1) / selectedTutorial.steps.length) * 100}%`,
            background: 'var(--blueprint)',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <h3 style={{
          fontFamily: "'VT323', monospace",
          fontSize: '1.3rem',
          color: 'var(--ink)',
          marginBottom: 8,
        }}>
          {step.title}
        </h3>
        <p style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: '0.9rem',
          color: 'var(--ink-soft)',
          lineHeight: 1.6,
          marginBottom: 16,
        }}>
          {step.description}
        </p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <div>
          {!isFirst && (
            <NavButton onClick={() => goToStep(currentStep - 1)}>
              ← Previous
            </NavButton>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isLast ? (
            <NavButton primary onClick={() => goToStep(currentStep + 1)}>
              Next →
            </NavButton>
          ) : (
            <NavButton primary onClick={() => { setSelectedTutorial(null); }}>
              ✓ Complete
            </NavButton>
          )}
          <NavButton onClick={() => { setSelectedTutorial(null); }}>
            Exit
          </NavButton>
        </div>
      </div>
    </OverlayPanel>
  );
}

function OverlayPanel({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      width: 380,
      maxHeight: 'calc(100% - 32px)',
      overflowY: 'auto',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--rule)',
      boxShadow: 'var(--shadow-panel)',
      zIndex: 20,
      padding: 0,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--rule-soft)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--blueprint)',
      }}>
        <span>{title}</span>
        <button onClick={onClose} style={{
          border: 'none', background: 'transparent', color: 'var(--ink-mute)',
          cursor: 'pointer', fontSize: '1rem', padding: '2px 6px',
        }}>✕</button>
      </div>
      <div style={{ padding: 16 }}>
        {children}
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    beginner: 'var(--terminal-green)',
    intermediate: 'var(--blueprint)',
    advanced: 'var(--terminal-yellow)',
    expert: 'var(--terminal-red)',
  };
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.6rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors[difficulty] || 'var(--ink-mute)',
      border: `1px solid ${colors[difficulty] || 'var(--ink-mute)'}`,
      padding: '2px 6px',
    }}>
      {difficulty}
    </span>
  );
}

function NavButton({ children, primary, onClick }: { children: React.ReactNode; primary?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.72rem',
      padding: '8px 14px',
      border: `1px solid ${primary ? 'var(--blueprint)' : 'var(--rule)'}`,
      background: primary ? 'var(--blueprint)' : 'transparent',
      color: primary ? 'var(--bg)' : 'var(--ink-soft)',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      transition: 'opacity 0.12s, background 0.12s',
    }}
    onMouseEnter={e => { if (!primary) { e.currentTarget.style.borderColor = 'var(--blueprint)'; e.currentTarget.style.color = 'var(--blueprint)'; } else { e.currentTarget.style.opacity = '0.85'; } }}
    onMouseLeave={e => { if (!primary) { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink-soft)'; } else { e.currentTarget.style.opacity = '1'; } }}
    >
      {children}
    </button>
  );
}

const cardStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '12px 14px',
  marginBottom: 10,
  border: '1px solid var(--rule-soft)',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'border-color 0.15s, background 0.15s',
  fontFamily: "'JetBrains Mono', monospace",
};
