import { useEffect, useRef, useState } from 'react';
import { useEditor, newId } from './store';
import type { Bounds, Camera, Element, ElementType, Point } from './types';
import { hitTest, screenToWorld, worldToScreen, zoomToward, normalizedBounds, boundsIntersect } from './geometry';
import { renderScene, type Palette } from './render';

type Interaction =
  | { mode: 'idle' }
  | { mode: 'pan'; startScreen: Point; startCam: Camera }
  | { mode: 'draw'; start: Point; el: Element }
  | { mode: 'move'; last: Point }
  | { mode: 'marquee'; start: Point };

const SHAPE_TOOLS: ElementType[] = ['rectangle', 'ellipse', 'diamond', 'line', 'arrow', 'text'];

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interaction = useRef<Interaction>({ mode: 'idle' });
  const draftRef = useRef<Element | null>(null);
  const marqueeRef = useRef<Bounds | null>(null);
  const spaceRef = useRef(false);
  const paletteRef = useRef<Palette>({ grid: '#ccc', selection: '#3553ff', selectionFill: 'rgba(53,83,255,0.08)' });
  const dirtyRef = useRef(true);
  const [editing, setEditing] = useState<{ id: string; isText: boolean; value: string; left: number; top: number; width: number; height: number } | null>(null);

  const mark = () => { dirtyRef.current = true; };

  // Resolve theme palette on mount + whenever the theme attribute flips
  useEffect(() => {
    const read = () => {
      paletteRef.current = {
        grid: cssVar('--rule-soft') || 'rgba(0,0,0,0.16)',
        selection: cssVar('--blueprint') || '#3553ff',
        selectionFill: cssVar('--blueprint-tint') || 'rgba(53,83,255,0.08)',
      };
      mark();
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  // Canvas sizing (device-pixel-ratio aware)
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      mark();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Render loop — only paints when something changed
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const unsub = useEditor.subscribe(mark);

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const s = useEditor.getState();
      renderScene({
        ctx,
        width: canvas.clientWidth,
        height: canvas.clientHeight,
        dpr,
        camera: s.camera,
        elements: s.elements,
        selectedIds: s.selectedIds,
        draft: draftRef.current,
        marquee: marqueeRef.current,
        palette: paletteRef.current,
      });
    };

    const loop = () => {
      if (dirtyRef.current) { draw(); dirtyRef.current = false; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); unsub(); };
  }, []);

  // Non-passive wheel: pan on scroll, zoom on ctrl/⌘ (trackpad pinch)
  useEffect(() => {
    const canvas = canvasRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = useEditor.getState();
      const rect = canvas.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        const anchor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const factor = Math.exp(-e.deltaY * 0.01);
        s.setCamera(zoomToward(s.camera, anchor, s.camera.zoom * factor));
      } else {
        s.setCamera({ ...s.camera, panX: s.camera.panX - e.deltaX, panY: s.camera.panY - e.deltaY });
      }
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // Keyboard: tools, delete, undo/redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack keys while typing into the label editor
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
      const s = useEditor.getState();
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) s.redo(); else s.undo();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (s.selectedIds.length) { s.snapshot(); s.deleteSelected(); }
        return;
      }
      if (e.key === 'Escape') { s.clearSelection(); return; }
      if (e.code === 'Space') { spaceRef.current = true; return; }
      const map: Record<string, string> = { v: 'select', r: 'rectangle', o: 'ellipse', d: 'diamond', l: 'line', a: 'arrow', t: 'text', h: 'pan' };
      const t = map[e.key.toLowerCase()];
      if (t) s.setTool(t as never);
    };
    const onUp = (e: KeyboardEvent) => { if (e.code === 'Space') spaceRef.current = false; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onUp); };
  }, []);

  // --- Pointer interaction ---
  const getScreen = (e: { clientX: number; clientY: number }): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    const s = useEditor.getState();
    const screen = getScreen(e);
    const world = screenToWorld(screen, s.camera);
    const wantPan = s.tool === 'pan' || spaceRef.current || e.button === 1;

    if (wantPan) {
      interaction.current = { mode: 'pan', startScreen: screen, startCam: s.camera };
      return;
    }

    // Text tool: drop a text element and open the editor immediately
    if (s.tool === 'text') {
      s.snapshot();
      const el = createElement('text', world);
      el.text = '';
      el.width = 140;
      el.height = 24;
      s.addElement(el);
      s.setSelection([el.id]);
      s.setTool('select');
      setEditing({ id: el.id, isText: true, value: '', left: screen.x, top: screen.y, width: 160, height: 30 });
      interaction.current = { mode: 'idle' };
      mark();
      return;
    }

    if (SHAPE_TOOLS.includes(s.tool as ElementType)) {
      s.snapshot();
      const el = createElement(s.tool as ElementType, world);
      draftRef.current = el;
      interaction.current = { mode: 'draw', start: world, el };
      mark();
      return;
    }

    // select tool — hit test topmost element
    const threshold = 6 / s.camera.zoom;
    const hit = [...s.elements].reverse().find(el => hitTest(world, el, threshold));
    if (hit) {
      if (e.shiftKey) s.toggleSelection(hit.id);
      else if (!s.selectedIds.includes(hit.id)) s.setSelection([hit.id]);
      s.snapshot();
      interaction.current = { mode: 'move', last: world };
    } else {
      if (!e.shiftKey) s.clearSelection();
      marqueeRef.current = { x: world.x, y: world.y, width: 0, height: 0 };
      interaction.current = { mode: 'marquee', start: world };
    }
    mark();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const it = interaction.current;
    if (it.mode === 'idle') return;
    const s = useEditor.getState();
    const screen = getScreen(e);
    const world = screenToWorld(screen, s.camera);

    if (it.mode === 'pan') {
      s.setCamera({ ...s.camera, panX: it.startCam.panX + (screen.x - it.startScreen.x), panY: it.startCam.panY + (screen.y - it.startScreen.y) });
    } else if (it.mode === 'draw') {
      it.el.width = world.x - it.start.x;
      it.el.height = world.y - it.start.y;
      draftRef.current = { ...it.el };
      mark();
    } else if (it.mode === 'move') {
      s.translateElements(s.selectedIds, world.x - it.last.x, world.y - it.last.y);
      it.last = world;
    } else if (it.mode === 'marquee') {
      const rect: Bounds = { x: it.start.x, y: it.start.y, width: world.x - it.start.x, height: world.y - it.start.y };
      marqueeRef.current = rect;
      const norm = normalizedBounds(rect);
      s.setSelection(s.elements.filter(el => boundsIntersect(norm, normalizedBounds(el))).map(el => el.id));
      mark();
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const s = useEditor.getState();
    const screen = getScreen(e);
    const world = screenToWorld(screen, s.camera);
    const threshold = 6 / s.camera.zoom;
    const hit = [...s.elements].reverse().find(el => hitTest(world, el, threshold));
    if (!hit) return;
    const b = normalizedBounds(hit);
    const tl = worldToScreen({ x: b.x, y: b.y }, s.camera);
    const isText = hit.type === 'text';
    s.snapshot();
    setEditing({
      id: hit.id,
      isText,
      value: isText ? hit.text || '' : hit.label || '',
      left: tl.x,
      top: tl.y,
      width: Math.max(b.width * s.camera.zoom, 90),
      height: Math.max(b.height * s.camera.zoom, 28),
    });
  };

  const commitEdit = () => {
    if (!editing) return;
    const s = useEditor.getState();
    const val = editing.value;
    if (editing.isText && val.trim() === '') {
      // discard an empty text box rather than leaving an invisible element
      s.setSelection([editing.id]);
      s.deleteSelected();
    } else {
      s.updateElement(editing.id, editing.isText ? { text: val } : { label: val });
    }
    setEditing(null);
    mark();
  };

  const onPointerUp = () => {
    const it = interaction.current;
    const s = useEditor.getState();
    if (it.mode === 'draw') {
      const el = it.el;
      const big = Math.abs(el.width) > 3 || Math.abs(el.height) > 3;
      draftRef.current = null;
      if (big) {
        s.addElement(el);
        s.setSelection([el.id]);
        s.setTool('select');
      }
    } else if (it.mode === 'marquee') {
      marqueeRef.current = null;
    }
    interaction.current = { mode: 'idle' };
    mark();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
          cursor: 'crosshair',
          background: 'var(--bg)',
        }}
      />
      {editing && (
        <input
          autoFocus
          value={editing.value}
          onChange={e => setEditing({ ...editing, value: e.target.value })}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
            else if (e.key === 'Escape') { e.preventDefault(); setEditing(null); }
          }}
          style={{
            position: 'absolute',
            left: editing.left,
            top: editing.top,
            width: editing.width,
            height: editing.height,
            border: '1px solid var(--blueprint)',
            outline: 'none',
            background: 'var(--bg-elevated)',
            color: 'var(--ink)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            textAlign: 'center',
            padding: '0 4px',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
}

function createElement(type: ElementType, at: Point): Element {
  const stroke = cssVar('--ink') || '#1a1a1a';
  return {
    id: newId(),
    type,
    x: at.x,
    y: at.y,
    width: 0,
    height: 0,
    stroke,
    fill: 'transparent',
    strokeWidth: 2,
    opacity: 1,
    text: type === 'text' ? 'Text' : undefined,
  };
}
