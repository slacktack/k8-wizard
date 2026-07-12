import type { Element } from './types';
import { boundsOfMany } from './geometry';
import { drawElement } from './render';

/* Import / export for the whiteboard: PNG raster + JSON project file. */

const FORMAT = 'k8wizard-whiteboard';

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportJson(elements: Element[], name = 'design'): void {
  const blob = new Blob([JSON.stringify({ format: FORMAT, version: 1, elements }, null, 2)], { type: 'application/json' });
  download(blob, `${name}.json`);
}

export function exportPng(elements: Element[], name = 'design'): void {
  const b = boundsOfMany(elements);
  if (!b) return;
  const pad = 32;
  const scale = 2; // crisp export
  const canvas = document.createElement('canvas');
  canvas.width = (b.width + pad * 2) * scale;
  canvas.height = (b.height + pad * 2) * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(pad - b.x, pad - b.y);
  for (const el of elements) drawElement(ctx, el);
  canvas.toBlob(blob => { if (blob) download(blob, `${name}.png`); }, 'image/png');
}

export function importJson(file: File): Promise<Element[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.elements)) resolve(data.elements as Element[]);
        else reject(new Error('Not a valid whiteboard file'));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
