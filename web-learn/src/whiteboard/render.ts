import type { Bounds, Camera, Element } from './types';
import { normalizedBounds, screenToWorld } from './geometry';

/* ============================================================
   Renderer — draws a frame of the scene onto a 2D context.
   Stateless: everything needed comes in as arguments. The camera
   transform is applied once, then elements are drawn in world
   coordinates. Screen-constant strokes (grid dots, selection)
   divide by zoom so they stay crisp at any scale.
   ============================================================ */

export interface Palette {
  grid: string;
  selection: string;
  selectionFill: string;
}

export interface Frame {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  camera: Camera;
  elements: Element[];
  selectedIds: string[];
  /** live preview element while drawing (not yet committed) */
  draft: Element | null;
  /** marquee selection rect in world coords, if box-selecting */
  marquee: Bounds | null;
  palette: Palette;
}

export function renderScene(f: Frame): void {
  const { ctx, width, height, dpr, camera } = f;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  drawGrid(f);

  // World-space transform for elements
  ctx.setTransform(dpr * camera.zoom, 0, 0, dpr * camera.zoom, dpr * camera.panX, dpr * camera.panY);

  for (const el of f.elements) drawElement(ctx, el);
  if (f.draft) drawElement(ctx, f.draft);

  drawSelection(f);
  drawMarquee(f);
}

function drawGrid(f: Frame): void {
  const { ctx, width, height, dpr, camera, palette } = f;
  const base = 20;
  // pick a spacing whose on-screen size stays comfortable
  let spacing = base;
  while (spacing * camera.zoom < 18) spacing *= 2;
  while (spacing * camera.zoom > 48) spacing /= 2;

  const tl = screenToWorld({ x: 0, y: 0 }, camera);
  const br = screenToWorld({ x: width, y: height }, camera);
  const startX = Math.floor(tl.x / spacing) * spacing;
  const startY = Math.floor(tl.y / spacing) * spacing;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = palette.grid;
  const r = 1;
  for (let wx = startX; wx <= br.x; wx += spacing) {
    for (let wy = startY; wy <= br.y; wy += spacing) {
      const sx = wx * camera.zoom + camera.panX;
      const sy = wy * camera.zoom + camera.panY;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawElement(ctx: CanvasRenderingContext2D, el: Element): void {
  const b = normalizedBounds(el);
  ctx.globalAlpha = el.opacity;
  ctx.strokeStyle = el.stroke;
  ctx.fillStyle = el.fill;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (el.strokeDasharray) {
    ctx.setLineDash(el.strokeDasharray.split(' ').map(Number));
  } else {
    ctx.setLineDash([]);
  }

  switch (el.type) {
    case 'rectangle': {
      if (el.fill !== 'transparent') ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.strokeRect(b.x, b.y, b.width, b.height);
      break;
    }
    case 'ellipse': {
      ctx.beginPath();
      ctx.ellipse(b.x + b.width / 2, b.y + b.height / 2, b.width / 2, b.height / 2, 0, 0, Math.PI * 2);
      if (el.fill !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }
    case 'diamond': {
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      ctx.beginPath();
      ctx.moveTo(cx, b.y);
      ctx.lineTo(b.x + b.width, cy);
      ctx.lineTo(cx, b.y + b.height);
      ctx.lineTo(b.x, cy);
      ctx.closePath();
      if (el.fill !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }
    case 'line':
    case 'arrow': {
      const x1 = el.x, y1 = el.y, x2 = el.x + el.width, y2 = el.y + el.height;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (el.type === 'arrow') drawArrowhead(ctx, x1, y1, x2, y2, el.strokeWidth);
      break;
    }
    case 'text': {
      ctx.globalAlpha = el.opacity;
      ctx.fillStyle = el.stroke;
      const size = Math.max(12, b.height || 20);
      ctx.font = `${size}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';
      ctx.fillText(el.text || '', b.x, b.y);
      break;
    }
  }

  // Centered label for shape components (e.g. "Load Balancer")
  if (el.label && el.type !== 'text' && el.type !== 'line' && el.type !== 'arrow') {
    ctx.fillStyle = el.stroke;
    ctx.font = "600 13px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(el.label, b.x + b.width / 2, b.y + b.height / 2, b.width - 12);
    ctx.textAlign = 'left';
  }

  ctx.globalAlpha = 1;
}

function drawArrowhead(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, sw: number): void {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 8 + sw * 2;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 7), y2 - size * Math.sin(angle - Math.PI / 7));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 7), y2 - size * Math.sin(angle + Math.PI / 7));
  ctx.stroke();
}

function drawSelection(f: Frame): void {
  const { ctx, camera, palette } = f;
  const selected = f.elements.filter(e => f.selectedIds.includes(e.id));
  if (selected.length === 0) return;

  ctx.lineWidth = 1 / camera.zoom;
  ctx.strokeStyle = palette.selection;
  ctx.setLineDash([4 / camera.zoom, 3 / camera.zoom]);
  const pad = 4 / camera.zoom;
  for (const el of selected) {
    const b = normalizedBounds(el);
    ctx.strokeRect(b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2);
  }
  ctx.setLineDash([]);
}

function drawMarquee(f: Frame): void {
  if (!f.marquee) return;
  const { ctx, camera, palette } = f;
  const b = normalizedBounds(f.marquee);
  ctx.lineWidth = 1 / camera.zoom;
  ctx.strokeStyle = palette.selection;
  ctx.fillStyle = palette.selectionFill;
  ctx.fillRect(b.x, b.y, b.width, b.height);
  ctx.strokeRect(b.x, b.y, b.width, b.height);
}
