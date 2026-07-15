import { useRef, useState, useCallback } from 'react';
import { useEditor } from './store';
import { listDesigns, saveDesign, overwriteDesign, loadDesign, deleteDesign, type DesignMeta } from './persistence';
import { exportPng, exportJson, importJson } from './io';

interface ModalState {
  type: 'prompt' | 'confirm' | 'alert' | null;
  title: string;
  message: string;
  defaultValue?: string;
  onConfirm?: (value: string) => void;
  onCancel?: () => void;
  onOk?: () => void;
}

function WhiteboardModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const [inputVal, setInputVal] = useState(state.defaultValue || '');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!state.type) return null;

  const handleConfirm = () => {
    if (state.type === 'prompt') {
      state.onConfirm?.(inputVal);
    } else if (state.type === 'confirm') {
      state.onConfirm?.('true');
    } else {
      state.onOk?.();
    }
    onClose();
  };

  const handleCancel = () => {
    if (state.type === 'prompt' || state.type === 'confirm') {
      state.onCancel?.();
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--overlay-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) handleCancel(); }}
      onKeyDown={e => { if (e.key === 'Escape') handleCancel(); }}
    >
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '2px solid var(--rule)',
          boxShadow: '8px 8px 0 var(--rule)',
          padding: 28,
          maxWidth: 420,
          width: '90%',
        }}
      >
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blueprint)', marginBottom: 10 }}>
          {state.title}
        </div>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: '0.92rem', color: 'var(--ink)', lineHeight: 1.5, marginBottom: 16 }}>
          {state.message}
        </p>

        {(state.type === 'prompt') && (
          <input
            ref={inputRef}
            autoFocus
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') handleCancel(); }}
            style={{
              width: '100%',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              padding: '8px 12px',
              border: '1px solid var(--rule)',
              background: 'var(--bg)',
              color: 'var(--ink)',
              outline: 'none',
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
          />
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {(state.type === 'prompt' || state.type === 'confirm') && (
            <button onClick={handleCancel} style={modalBtn(false)}>Cancel</button>
          )}
          <button onClick={handleConfirm} style={modalBtn(true)}>
            {state.type === 'confirm' ? 'Yes' : state.type === 'alert' ? 'OK' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function modalBtn(primary: boolean): React.CSSProperties {
  return {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '8px 18px',
    border: `1px solid ${primary ? 'var(--blueprint)' : 'var(--rule)'}`,
    background: primary ? 'var(--blueprint)' : 'transparent',
    color: primary ? 'var(--bg)' : 'var(--ink-soft)',
    cursor: 'pointer',
  };
}

export default function Menu() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'main' | 'open'>('main');
  const [designs, setDesigns] = useState<DesignMeta[]>([]);
  const [current, setCurrent] = useState<{ id: string; name: string } | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: null, title: '', message: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const closeModal = useCallback(() => setModal({ type: null, title: '', message: '' }), []);

  const showPrompt = (title: string, message: string, defaultValue: string): Promise<string | null> => {
    return new Promise(resolve => {
      setModal({
        type: 'prompt', title, message, defaultValue,
        onConfirm: (val: string) => resolve(val),
        onCancel: () => resolve(null),
      });
    });
  };

  const showConfirm = (title: string, message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setModal({
        type: 'confirm', title, message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  const showAlert = (title: string, message: string): Promise<void> => {
    return new Promise(resolve => {
      setModal({
        type: 'alert', title, message,
        onOk: () => resolve(),
      });
    });
  };

  const openMenu = () => { setDesigns(listDesigns()); setView('main'); setOpen(o => !o); };
  const close = () => setOpen(false);

  const doSave = async () => {
    const els = useEditor.getState().elements;
    if (current) {
      overwriteDesign(current.id, els);
    } else {
      const name = await showPrompt('Save Design', 'Name this design:', 'Untitled');
      if (name === null) return;
      const meta = saveDesign(name, els);
      setCurrent({ id: meta.id, name: meta.name });
    }
    close();
  };

  const doSaveAs = async () => {
    const name = await showPrompt('Save As', 'Save as:', current?.name || 'Untitled');
    if (name === null) return;
    const meta = saveDesign(name, useEditor.getState().elements);
    setCurrent({ id: meta.id, name: meta.name });
    close();
  };

  const doOpen = (m: DesignMeta) => {
    const els = loadDesign(m.id);
    if (els) { useEditor.getState().setElements(els); setCurrent({ id: m.id, name: m.name }); }
    close();
  };

  const doNew = async () => {
    const els = useEditor.getState().elements;
    if (els.length) {
      const confirmed = await showConfirm('New Board', 'Start a new board? The current board stays in autosave only.');
      if (!confirmed) return;
    }
    useEditor.getState().setElements([]);
    setCurrent(null);
    close();
  };

  const doDelete = async (m: DesignMeta) => {
    const confirmed = await showConfirm('Delete Design', `Delete "${m.name}"?`);
    if (!confirmed) return;
    deleteDesign(m.id);
    setDesigns(listDesigns());
    if (current?.id === m.id) setCurrent(null);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const els = await importJson(f);
      useEditor.getState().setElements(els);
      setCurrent(null);
      close();
    } catch {
      await showAlert('Import Error', 'That file is not a valid whiteboard export.');
    }
  };

  const name = current?.name || 'Untitled · unsaved';

  return (
    <>
      <WhiteboardModal state={modal} onClose={closeModal} />
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={openMenu} aria-label="Menu" style={hamburger}>
            <svg width="18" height="18" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" /></svg>
          </button>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-mute)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
        </div>

        {open && (
          <div style={panel}>
            {view === 'main' ? (
              <>
                <MenuItem label="New board" onClick={doNew} />
                <MenuItem label="Save" onClick={doSave} />
                <MenuItem label="Save as…" onClick={doSaveAs} />
                <MenuItem label={`Open… (${designs.length})`} onClick={() => setView('open')} />
                <Divider />
                <MenuItem label="Export PNG" onClick={() => { exportPng(useEditor.getState().elements, current?.name || 'design'); close(); }} />
                <MenuItem label="Export JSON" onClick={() => { exportJson(useEditor.getState().elements, current?.name || 'design'); close(); }} />
                <MenuItem label="Import JSON…" onClick={() => fileRef.current?.click()} />
                <Divider />
                <MenuItem label="Clear canvas" danger onClick={doNew} />
              </>
            ) : (
              <>
                <MenuItem label="← Back" onClick={() => setView('main')} />
                <Divider />
                {designs.length === 0 && (
                  <div style={{ padding: '10px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--ink-mute)' }}>
                    No saved designs yet.
                  </div>
                )}
                {designs.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => doOpen(m)} style={{ ...itemBase, flex: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-tint)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--ink-mute)' }}>{new Date(m.updatedAt).toLocaleDateString()}</span>
                    </button>
                    <button onClick={() => doDelete(m)} aria-label={`Delete ${m.name}`} title="Delete"
                      style={{ border: 'none', background: 'transparent', color: 'var(--ink-mute)', cursor: 'pointer', padding: '0 10px', fontSize: '0.9rem' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--terminal-red)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-mute)'; }}>×</button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} style={{ display: 'none' }} />
      </div>
    </>
  );
}

const hamburger: React.CSSProperties = {
  width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid var(--rule)', background: 'var(--bg-elevated)', color: 'var(--ink-soft)',
  cursor: 'pointer', boxShadow: 'var(--shadow-panel)',
};

const panel: React.CSSProperties = {
  marginTop: 8, width: 240, background: 'var(--bg-elevated)', border: '1px solid var(--rule)',
  boxShadow: 'var(--shadow-panel)', padding: 4, maxHeight: '70vh', overflowY: 'auto',
};

const itemBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent',
  color: 'var(--ink)', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem',
};

function MenuItem({ label, hint, onClick, danger }: { label: string; hint?: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ ...itemBase, color: danger ? 'var(--terminal-red)' : 'var(--ink)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--blueprint-tint)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span>{label}</span>
      {hint && <span style={{ color: 'var(--ink-mute)', fontSize: '0.68rem' }}>{hint}</span>}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--rule-soft)', margin: '4px 0' }} />;
}
