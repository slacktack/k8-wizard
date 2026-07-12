import { useEffect } from 'react';
import Header from '../components/layout/Header';
import WhiteboardCanvas from './WhiteboardCanvas';
import Toolbar from './Toolbar';
import ComponentPalette from './ComponentPalette';
import Menu from './Menu';
import { useEditor } from './store';
import { zoomToward } from './geometry';
import { loadCurrent, saveCurrent } from './persistence';

function ZoomControls() {
  const camera = useEditor(s => s.camera);
  const setCamera = useEditor(s => s.setCamera);
  const pct = Math.round(camera.zoom * 100);

  const zoomBy = (factor: number) => {
    const anchor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setCamera(zoomToward(camera, anchor, camera.zoom * factor));
  };
  const reset = () => setCamera({ ...camera, zoom: 1 });

  const btn: React.CSSProperties = {
    width: 32, height: 32, border: 'none', background: 'transparent',
    color: 'var(--ink-soft)', cursor: 'pointer', fontSize: '1rem',
    fontFamily: "'JetBrains Mono', monospace",
  };

  return (
    <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--rule)', boxShadow: 'var(--shadow-panel)', zIndex: 10 }}>
      <button onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out" style={btn}>−</button>
      <button onClick={reset} aria-label="Reset zoom" style={{ ...btn, width: 56, fontSize: '0.72rem' }}>{pct}%</button>
      <button onClick={() => zoomBy(1.2)} aria-label="Zoom in" style={btn}>+</button>
    </div>
  );
}

export default function WhiteboardPage() {
  // Load the autosaved board, then persist changes (debounced)
  useEffect(() => {
    const els = loadCurrent();
    if (els && els.length) useEditor.getState().setElements(els);

    let t: ReturnType<typeof setTimeout>;
    const unsub = useEditor.subscribe((s, prev) => {
      if (s.elements !== prev.elements) {
        clearTimeout(t);
        t = setTimeout(() => saveCurrent(useEditor.getState().elements), 400);
      }
    });
    return () => { clearTimeout(t); unsub(); };
  }, []);

  return (
    <>
      <Header />
      <div style={{ position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <WhiteboardCanvas />
        <ComponentPalette />
        <Menu />
        <Toolbar />
        <ZoomControls />
        <div
          style={{
            position: 'absolute', bottom: 18, right: 16, zIndex: 10,
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.66rem',
            color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em',
            pointerEvents: 'none', textAlign: 'right', lineHeight: 1.6,
          }}
          className="wb-hint"
        >
          Scroll to pan · ⌘/ctrl+scroll to zoom<br />Space to drag · V R O D L A T to switch tools
        </div>
      </div>
    </>
  );
}
