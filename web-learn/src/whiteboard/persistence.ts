import type { Element } from './types';

/* ============================================================
   Persistence — localStorage-backed board storage.
   ------------------------------------------------------------
   - The working board autosaves to `wb:current` so a reload
     never loses work.
   - Named boards live under `wb:design:<id>` with an index at
     `wb:index`, so the user can save, list and reopen designs.

   Kept behind a small typed surface so it can move to IndexedDB
   later without touching call sites.
   ============================================================ */

const CURRENT = 'wb:current';
const INDEX = 'wb:index';
const PREFIX = 'wb:design:';

export interface DesignMeta {
  id: string;
  name: string;
  updatedAt: number;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — fail silently */
  }
}

// --- Working board ------------------------------------------
export function saveCurrent(elements: Element[]): void {
  write(CURRENT, { elements });
}

export function loadCurrent(): Element[] | null {
  const data = read<{ elements: Element[] } | null>(CURRENT, null);
  return data?.elements ?? null;
}

// --- Named designs ------------------------------------------
export function listDesigns(): DesignMeta[] {
  return read<DesignMeta[]>(INDEX, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

function putIndex(metas: DesignMeta[]): void {
  write(INDEX, metas);
}

export function saveDesign(name: string, elements: Element[]): DesignMeta {
  const id = `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const meta: DesignMeta = { id, name: name.trim() || 'Untitled', updatedAt: Date.now() };
  write(PREFIX + id, { ...meta, elements });
  putIndex([meta, ...listDesigns()]);
  return meta;
}

export function overwriteDesign(id: string, elements: Element[]): void {
  const metas = listDesigns();
  const meta = metas.find(m => m.id === id);
  if (!meta) return;
  meta.updatedAt = Date.now();
  write(PREFIX + id, { ...meta, elements });
  putIndex(metas);
}

export function loadDesign(id: string): Element[] | null {
  const data = read<{ elements: Element[] } | null>(PREFIX + id, null);
  return data?.elements ?? null;
}

export function deleteDesign(id: string): void {
  try { localStorage.removeItem(PREFIX + id); } catch { /* ignore */ }
  putIndex(listDesigns().filter(m => m.id !== id));
}

export function renameDesign(id: string, name: string): void {
  const metas = listDesigns();
  const meta = metas.find(m => m.id === id);
  if (!meta) return;
  meta.name = name.trim() || meta.name;
  const els = loadDesign(id) ?? [];
  write(PREFIX + id, { ...meta, elements: els });
  putIndex(metas);
}
