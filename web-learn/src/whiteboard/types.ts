/* ============================================================
   Whiteboard — core types
   System Design Playground: an Excalidraw-inspired editor built
   from first principles. This file is the single source of truth
   for the element model and tool set; rendering, interaction and
   state all depend on these shapes but never redefine them.
   ============================================================ */

export type ElementType = 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'text';

export type Tool = 'select' | 'pan' | ElementType;

export interface Point {
  x: number;
  y: number;
}

/** A drawable element. Position/size are in WORLD coordinates. */
export interface Element {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
  text?: string;
  /** centered label drawn inside a shape (system-design component name) */
  label?: string;
  /** dash pattern for dashed lines, e.g. '4 3' */
  strokeDasharray?: string;
}

/** Camera maps world → screen: screen = world * zoom + pan. */
export interface Camera {
  panX: number;
  panY: number;
  zoom: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
