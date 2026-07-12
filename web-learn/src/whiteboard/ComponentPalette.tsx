import { useEditor, newId } from './store';
import { screenToWorld } from './geometry';
import type { Element } from './types';

interface Template {
  label: string;
  colorVar: string;
}

interface Category {
  name: string;
  items: Template[];
}

/* System-design building blocks. Each drops a labelled node so the
   canvas is a real design surface, not a blank shape editor. */
const CATEGORIES: Category[] = [
  { name: 'Client', items: [
    { label: 'Client', colorVar: '--terminal-blue' },
    { label: 'Browser', colorVar: '--terminal-blue' },
    { label: 'Mobile App', colorVar: '--terminal-blue' },
  ] },
  { name: 'Edge', items: [
    { label: 'CDN', colorVar: '--terminal-cyan' },
    { label: 'Load Balancer', colorVar: '--terminal-cyan' },
    { label: 'API Gateway', colorVar: '--terminal-cyan' },
  ] },
  { name: 'Compute', items: [
    { label: 'Service', colorVar: '--terminal-green' },
    { label: 'Worker', colorVar: '--terminal-green' },
    { label: 'Function', colorVar: '--terminal-green' },
  ] },
  { name: 'Data', items: [
    { label: 'SQL DB', colorVar: '--terminal-orange' },
    { label: 'NoSQL DB', colorVar: '--terminal-orange' },
    { label: 'Cache', colorVar: '--terminal-orange' },
    { label: 'Object Store', colorVar: '--terminal-orange' },
  ] },
  { name: 'Messaging', items: [
    { label: 'Message Queue', colorVar: '--terminal-magenta' },
    { label: 'Event Bus', colorVar: '--terminal-magenta' },
    { label: 'Stream', colorVar: '--terminal-magenta' },
  ] },
];

let dropOffset = 0;

export default function ComponentPalette() {
  const addElement = useEditor(s => s.addElement);
  const snapshot = useEditor(s => s.snapshot);
  const setSelection = useEditor(s => s.setSelection);
  const setTool = useEditor(s => s.setTool);

  const drop = (t: Template) => {
    const { camera } = useEditor.getState();
    const stroke = getComputedStyle(document.documentElement).getPropertyValue(t.colorVar).trim() || '#3553ff';
    // near the centre of the current viewport, cascading so drops don't stack
    dropOffset = (dropOffset + 24) % 160;
    const center = screenToWorld({ x: window.innerWidth / 2, y: (window.innerHeight + 64) / 2 }, camera);
    const w = 150, h = 60;
    const el: Element = {
      id: newId(),
      type: 'rectangle',
      x: center.x - w / 2 + dropOffset,
      y: center.y - h / 2 + dropOffset,
      width: w,
      height: h,
      stroke,
      fill: 'transparent',
      strokeWidth: 2,
      opacity: 1,
      label: t.label,
    };
    snapshot();
    addElement(el);
    setSelection([el.id]);
    setTool('select');
  };

  return (
    <div
      className="wb-palette"
      style={{
        position: 'absolute',
        top: 68,
        left: 16,
        width: 168,
        maxHeight: 'calc(100% - 96px)',
        overflowY: 'auto',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--rule)',
        boxShadow: 'var(--shadow-panel)',
        zIndex: 10,
        padding: '10px 10px 14px',
      }}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-mute)', marginBottom: 10 }}>
        Components
      </div>
      {CATEGORIES.map(cat => (
        <div key={cat.name} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blueprint)', marginBottom: 6 }}>
            {cat.name}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cat.items.map(item => (
              <button
                key={item.label}
                onClick={() => drop(item)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  textAlign: 'left',
                  padding: '6px 8px',
                  border: '1px solid var(--rule-soft)',
                  borderLeft: `3px solid var(${item.colorVar})`,
                  background: 'transparent',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-tint)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)'; }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
