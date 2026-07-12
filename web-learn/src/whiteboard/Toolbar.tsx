import { useEditor } from './store';
import type { Tool } from './types';

interface ToolDef {
  tool: Tool;
  label: string;
  hint: string;
  icon: React.ReactNode;
}

const S = { width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 } as const;

const TOOLS: ToolDef[] = [
  { tool: 'select', label: 'Select', hint: 'V', icon: <svg {...S} viewBox="0 0 20 20"><path d="M4 3l6 14 2-6 6-2z" strokeLinejoin="round" /></svg> },
  { tool: 'pan', label: 'Pan', hint: 'H', icon: <svg {...S} viewBox="0 0 20 20"><path d="M6 10V5a1.5 1.5 0 013 0v4V4a1.5 1.5 0 013 0v5V6a1.5 1.5 0 013 0v6a5 5 0 01-5 5H10a5 5 0 01-4-2l-3-4a1.5 1.5 0 012-2z" strokeLinejoin="round" /></svg> },
  { tool: 'rectangle', label: 'Rectangle', hint: 'R', icon: <svg {...S} viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="10" /></svg> },
  { tool: 'ellipse', label: 'Ellipse', hint: 'O', icon: <svg {...S} viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="7" ry="6" /></svg> },
  { tool: 'diamond', label: 'Diamond', hint: 'D', icon: <svg {...S} viewBox="0 0 20 20"><path d="M10 3l7 7-7 7-7-7z" strokeLinejoin="round" /></svg> },
  { tool: 'line', label: 'Line', hint: 'L', icon: <svg {...S} viewBox="0 0 20 20"><path d="M4 16L16 4" strokeLinecap="round" /></svg> },
  { tool: 'arrow', label: 'Arrow', hint: 'A', icon: <svg {...S} viewBox="0 0 20 20"><path d="M4 16L16 4M16 4h-6M16 4v6" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { tool: 'text', label: 'Text', hint: 'T', icon: <svg {...S} viewBox="0 0 20 20"><path d="M5 5h10M10 5v11" strokeLinecap="round" /></svg> },
];

export default function Toolbar() {
  const tool = useEditor(s => s.tool);
  const setTool = useEditor(s => s.setTool);
  const undo = useEditor(s => s.undo);
  const redo = useEditor(s => s.redo);
  const canUndo = useEditor(s => s.past.length > 0);
  const canRedo = useEditor(s => s.future.length > 0);

  return (
    <div
      role="toolbar"
      aria-label="Drawing tools"
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 4,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--rule)',
        boxShadow: 'var(--shadow-panel)',
        zIndex: 10,
      }}
    >
      {TOOLS.map(t => {
        const active = tool === t.tool;
        return (
          <button
            key={t.tool}
            onClick={() => setTool(t.tool)}
            aria-label={`${t.label} (${t.hint})`}
            title={`${t.label} — ${t.hint}`}
            aria-pressed={active}
            style={{
              position: 'relative',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              background: active ? 'var(--blueprint)' : 'transparent',
              color: active ? 'var(--bg)' : 'var(--ink-soft)',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--blueprint-tint)'; e.currentTarget.style.color = 'var(--blueprint)'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)'; } }}
          >
            {t.icon}
          </button>
        );
      })}

      <div style={{ width: 1, height: 22, background: 'var(--rule-soft)', margin: '0 4px' }} />

      <button onClick={undo} disabled={!canUndo} aria-label="Undo (⌘Z)" title="Undo — ⌘Z" style={iconBtn(canUndo)}>
        <svg {...S} viewBox="0 0 20 20"><path d="M7 6L3 10l4 4M3 10h9a4 4 0 010 8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button onClick={redo} disabled={!canRedo} aria-label="Redo (⌘⇧Z)" title="Redo — ⌘⇧Z" style={iconBtn(canRedo)}>
        <svg {...S} viewBox="0 0 20 20"><path d="M13 6l4 4-4 4M17 10H8a4 4 0 000 8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

function iconBtn(enabled: boolean): React.CSSProperties {
  return {
    width: 34,
    height: 34,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    color: enabled ? 'var(--ink-soft)' : 'var(--ink-mute)',
    cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.4,
  };
}
