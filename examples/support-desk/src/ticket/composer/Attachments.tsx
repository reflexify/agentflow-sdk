import { useRef, type Ref } from 'react';
import { useDesk, useT } from '../../data/desk-context.js';
import type { FileRef } from '../../model/types.js';

export function AttachButton({ onFiles, disabled, ref }: { onFiles(files: File[]): void; disabled: boolean; ref?: Ref<HTMLButtonElement> }) {
  const tr = useT();
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button ref={ref} className="link" disabled={disabled} onClick={() => input.current?.click()}>{tr('attach')}</button>
      <input ref={input} type="file" multiple hidden aria-label={tr('attach')}
        onChange={(e) => { const files = [...(e.target.files ?? [])]; e.target.value = ''; if (files.length) onFiles(files); }} />
    </>
  );
}

export function AttachedFiles({ files, onRemove, disabled }: { files: FileRef[]; onRemove(id: string): void; disabled: boolean }) {
  const tr = useT();
  const { api } = useDesk();
  if (!files.length) return null;
  return (
    <div className="files">
      {files.map((f) => (
        <span key={f.id} className="file">
          <span className="ext">{(f.name.split('.').pop() ?? '').slice(0, 4).toUpperCase()}</span>
          <a href={api.downloadUrl(f.id)} target="_blank" rel="noreferrer">{f.name}</a>
          <button className="link" disabled={disabled} aria-label={tr('remove', { name: f.name })} onClick={() => onRemove(f.id)}>×</button>
        </span>
      ))}
    </div>
  );
}
