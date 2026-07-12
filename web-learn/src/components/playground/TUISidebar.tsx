import TUIPanel from '../tui/TUIPanel';
import TUIKeyHints from '../tui/TUIKeyHints';
import K8VizDiagram from '../tui/K8VizDiagram';

interface Step {
  id: number;
  title: string;
  done: boolean;
  current: boolean;
}

interface TUISidebarProps {
  steps: Step[];
  onRun: () => void;
  onReset: () => void;
  canRun: boolean;
}

export default function TUISidebar({ steps, onRun, onReset, canRun }: TUISidebarProps) {
  const doneCount = steps.filter(s => s.done).length;

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* CONTROLS ON TOP — Run/Reset at the top of sidebar */}
      <TUIPanel title="Controls">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={onRun}
            disabled={!canRun}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '10px 16px',
              border: '1px solid var(--tui-border)',
              background: canRun ? 'var(--tui-blue)' : 'transparent',
              color: canRun ? '#0f1424' : 'var(--ink-mute)',
              cursor: canRun ? 'pointer' : 'not-allowed',
              transition: 'background 0.1s, filter 0.1s',
            }}
            onMouseEnter={e => { if (canRun) e.currentTarget.style.filter = 'brightness(1.12)'; }}
            onMouseLeave={e => { if (canRun) e.currentTarget.style.filter = 'none'; }}
          >
            {canRun ? `▶ Run: ${steps.find(s => s.current)?.title || 'Complete'}` : '✓ All Steps Complete'}
          </button>
          <button
            onClick={onReset}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '10px 16px',
              border: '1px solid var(--tui-border)',
              background: 'transparent',
              color: 'var(--tui-text)',
              cursor: 'pointer',
              transition: 'color 0.1s, border-color 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--terminal-red)'; e.currentTarget.style.borderColor = 'var(--terminal-red)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--tui-text)'; e.currentTarget.style.borderColor = 'var(--tui-border)'; }}
          >
            ↺ Reset
          </button>
        </div>
      </TUIPanel>

      {/* Status Panel */}
      <TUIPanel title="Status">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
          {[
            { label: 'Step', value: `${doneCount}/${steps.length}`, color: 'var(--tui-cyan)' },
            { label: 'Cluster', value: doneCount > 0 ? 'kind-learn' : '—', color: doneCount > 0 ? 'var(--tui-green)' : 'var(--ink-mute)' },
            { label: 'Namespace', value: doneCount >= 4 ? 'demo' : '—', color: doneCount >= 4 ? 'var(--tui-text)' : 'var(--ink-mute)' },
            { label: 'Pods', value: doneCount >= 6 ? '3 running' : '—', color: doneCount >= 6 ? 'var(--tui-green)' : 'var(--ink-mute)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8, marginBottom: 4 }}>
              <span style={{ color: 'var(--tui-cyan)', textAlign: 'right' }}>{item.label}:</span>
              <span style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </TUIPanel>

      {/* Steps */}
      <TUIPanel title="Steps">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', maxHeight: 220, overflowY: 'auto' }}>
          {steps.map((step) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '3px 0',
                color: step.done ? 'var(--tui-green)' : step.current ? 'var(--tui-blue)' : 'var(--ink-mute)',
              }}
            >
              <span style={{ flexShrink: 0, width: 14 }}>{step.done ? '✓' : step.current ? '▸' : '○'}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.title}</span>
            </div>
          ))}
        </div>
      </TUIPanel>

      {/* Architecture */}
      <TUIPanel title="Architecture">
        <K8VizDiagram />
      </TUIPanel>

      <TUIKeyHints hints={[
        { key: 'Run', description: 'Execute Step' },
        { key: 'Tab', description: 'Focus Terminal' },
      ]} />
    </aside>
  );
}
