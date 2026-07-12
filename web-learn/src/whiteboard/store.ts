import { create } from 'zustand';
import type { Camera, Element, Tool } from './types';

/* ============================================================
   Editor store (Zustand)
   ------------------------------------------------------------
   Lives outside React's render cycle so the rAF render loop can
   read the latest state directly via getState(). Components that
   need to re-render (toolbar, etc.) subscribe with the hook.

   History is snapshot-based for the MVP. It is deliberately behind
   a small surface (snapshot / undo / redo) so it can be swapped
   for a command-pattern log later without touching call sites.
   ============================================================ */

const MAX_HISTORY = 100;

export interface EditorState {
  elements: Element[];
  selectedIds: string[];
  tool: Tool;
  camera: Camera;
  past: Element[][];
  future: Element[][];

  // tool + camera
  setTool: (tool: Tool) => void;
  setCamera: (camera: Camera) => void;

  // elements
  setElements: (elements: Element[]) => void;
  addElement: (el: Element) => void;
  updateElement: (id: string, patch: Partial<Element>) => void;
  updateElements: (ids: string[], patch: Partial<Element>) => void;
  translateElements: (ids: string[], dx: number, dy: number) => void;
  deleteSelected: () => void;

  // selection
  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;

  // z-order
  bringToFront: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;

  // history
  snapshot: () => void;
  undo: () => void;
  redo: () => void;
}

const clone = (els: Element[]): Element[] => els.map(e => ({ ...e }));

export const useEditor = create<EditorState>((set) => ({
  elements: [],
  selectedIds: [],
  tool: 'select',
  camera: { panX: 0, panY: 0, zoom: 1 },
  past: [],
  future: [],

  setTool: tool => set({ tool }),
  setCamera: camera => set({ camera }),

  // Replace the whole board (loading a design / import). Clears history
  // so undo can't cross document boundaries.
  setElements: elements => set({ elements, selectedIds: [], past: [], future: [] }),

  addElement: el => set(s => ({ elements: [...s.elements, el] })),

  updateElement: (id, patch) =>
    set(s => ({ elements: s.elements.map(e => (e.id === id ? { ...e, ...patch } : e)) })),

  updateElements: (ids, patch) =>
    set(s => ({ elements: s.elements.map(e => (ids.includes(e.id) ? { ...e, ...patch } : e)) })),

  translateElements: (ids, dx, dy) =>
    set(s => ({
      elements: s.elements.map(e => (ids.includes(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e)),
    })),

  deleteSelected: () =>
    set(s => ({
      elements: s.elements.filter(e => !s.selectedIds.includes(e.id)),
      selectedIds: [],
    })),

  setSelection: ids => set({ selectedIds: ids }),
  toggleSelection: id =>
    set(s => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter(x => x !== id)
        : [...s.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),

  bringToFront: ids =>
    set(s => {
      const moved = s.elements.filter(e => ids.includes(e.id));
      const rest = s.elements.filter(e => !ids.includes(e.id));
      return { elements: [...rest, ...moved] };
    }),
  sendToBack: ids =>
    set(s => {
      const moved = s.elements.filter(e => ids.includes(e.id));
      const rest = s.elements.filter(e => !ids.includes(e.id));
      return { elements: [...moved, ...rest] };
    }),

  snapshot: () =>
    set(s => ({
      past: [...s.past, clone(s.elements)].slice(-MAX_HISTORY),
      future: [],
    })),

  undo: () =>
    set(s => {
      if (s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1];
      return {
        elements: previous,
        past: s.past.slice(0, -1),
        future: [clone(s.elements), ...s.future].slice(0, MAX_HISTORY),
        selectedIds: [],
      };
    }),

  redo: () =>
    set(s => {
      if (s.future.length === 0) return s;
      const next = s.future[0];
      return {
        elements: next,
        future: s.future.slice(1),
        past: [...s.past, clone(s.elements)].slice(-MAX_HISTORY),
        selectedIds: [],
      };
    }),
}));

let idCounter = 0;
export function newId(): string {
  idCounter += 1;
  return `el_${Date.now().toString(36)}_${idCounter}`;
}
