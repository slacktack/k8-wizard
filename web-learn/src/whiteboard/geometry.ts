import type { Bounds, Camera, Element, Point } from './types';

/* ============================================================
   Geometry — pure coordinate + hit-testing helpers.
   No React, no canvas, no state. Everything here is a function
   of its inputs so it can be unit-tested and reused freely.
   ============================================================ */

// --- Coordinate systems -------------------------------------
export function worldToScreen(p: Point, cam: Camera): Point {
  return { x: p.x * cam.zoom + cam.panX, y: p.y * cam.zoom + cam.panY };
}

export function screenToWorld(p: Point, cam: Camera): Point {
  return { x: (p.x - cam.panX) / cam.zoom, y: (p.y - cam.panY) / cam.zoom };
}

/** Zoom toward an anchor point (in screen space), keeping the world
    point under the anchor fixed — the "zoom towards cursor" feel. */
export function zoomToward(cam: Camera, anchor: Point, nextZoom: number): Camera {
  const world = screenToWorld(anchor, cam);
  const zoom = clamp(nextZoom, 0.1, 8);
  return {
    zoom,
    panX: anchor.x - world.x * zoom,
    panY: anchor.y - world.y * zoom,
  };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// --- Element bounds -----------------------------------------
/** Normalised bounds (positive width/height) for an element that
    may have been drawn right-to-left or bottom-to-top. */
export function normalizedBounds(el: Bounds): Bounds {
  return {
    x: el.width < 0 ? el.x + el.width : el.x,
    y: el.height < 0 ? el.y + el.height : el.y,
    width: Math.abs(el.width),
    height: Math.abs(el.height),
  };
}

export function boundsOfMany(els: Element[]): Bounds | null {
  if (els.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of els) {
    const b = normalizedBounds(el);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// --- Hit testing (world space) ------------------------------
export function pointInBounds(p: Point, b: Bounds, pad = 0): boolean {
  return p.x >= b.x - pad && p.x <= b.x + b.width + pad && p.y >= b.y - pad && p.y <= b.y + b.height + pad;
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = clamp(t, 0, 1);
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Does a world-space point hit this element? Threshold is in world units. */
export function hitTest(p: Point, el: Element, threshold: number): boolean {
  const b = normalizedBounds(el);
  if (el.type === 'line' || el.type === 'arrow') {
    return distToSegment(p, { x: el.x, y: el.y }, { x: el.x + el.width, y: el.y + el.height }) <= threshold;
  }
  if (el.type === 'ellipse') {
    const rx = b.width / 2, ry = b.height / 2;
    if (rx === 0 || ry === 0) return false;
    const nx = (p.x - (b.x + rx)) / rx;
    const ny = (p.y - (b.y + ry)) / ry;
    return nx * nx + ny * ny <= 1.15; // slight padding for easier grabbing
  }
  // rectangle / diamond / text → bounding box
  return pointInBounds(p, b, threshold);
}

export function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
