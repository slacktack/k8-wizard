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
      {/* Status Panel */}
      <TUIPanel title="Cluster Status">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
          {[
            { label: 'Context', value: 'kind-learn', color: 'var(--tui-green)' },
            { label: 'Namespace', value: 'default', color: 'var(--tui-text)' },
            { label: 'Nodes', value: '3 Ready', color: 'var(--tui-green)' },
            { label: 'Pods', value: `${doneCount} running`, color: 'var(--tui-cyan)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8, marginBottom: 4 }}>
              <span style={{ color: 'var(--tui-cyan)', textAlign: 'right' }}>{item.label}:</span>
              <span style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </TUIPanel>

      {/* K8 Architecture Viz */}
      <TUIPanel title="Architecture">
        <K8VizDiagram />
      </TUIPanel>

      {/* Step Progress Panel */}
      <TUIPanel title="Steps">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}>
          {steps.map((step) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 0',
                color: step.done ? 'var(--tui-green)' : step.current ? 'var(--tui-cyan)' : 'var(--tui-mute)',
              }}
            >
              <span>{step.done ? '✓' : step.current ? '▸' : '○'}</span>
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      </TUIPanel>

      {/* Control Panel */}
      <TUIPanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={onRun}
            disabled={!canRun}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              padding: '8px 16px',
              border: '1px solid var(--tui-border)',
              background: canRun ? 'var(--tui-cyan)' : 'transparent',
              color: canRun ? 'var(--tui-bg)' : 'var(--tui-mute)',
              cursor: canRun ? 'pointer' : 'not-allowed',
              transition: 'background 0.1s',
            }}
          >
            {canRun ? `▶ Run: ${steps.find(s => s.current)?.title || 'Complete'}` : '✓ All Steps Complete'}
          </button>
          <button
            onClick={onReset}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              padding: '8px 16px',
              border: '1px solid var(--tui-border)',
              background: 'transparent',
              color: 'var(--tui-text)',
              cursor: 'pointer',
            }}
          >
            ↺ Reset
          </button>
        </div>
      </TUIPanel>

      {/* Key Hints */}
      <TUIKeyHints hints={[
        { key: 'Run', description: 'Execute Step' },
        { key: 'Tab', description: 'Focus Terminal' },
      ]} />
    </aside>
  );
}
