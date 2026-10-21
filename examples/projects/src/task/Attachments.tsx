import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { useProjects, useT } from '../data/context.js';
import { useReportFailure } from '../data/failure.js';
import { Tooltip } from '../kit/elements.js';
import { formatBytes, formatCount } from '../model/format.js';
import { can } from '../model/roles.js';
import type { Attachment, Project, Task } from '../model/types.js';
import { FileIcon, FileText, ImageIcon, LockIcon, Paperclip } from '../shared/icons.js';
import type { TextKey } from '../text.js';
import type { DrawerWriter } from './fields.js';

type Kind = 'image' | 'pdf' | 'other';
const kindOf = (type: string | undefined): Kind =>
  !type ? 'other' : type.startsWith('image/') ? 'image' : type === 'application/pdf' ? 'pdf' : 'other';
/** A file's metadata never changes, so it is read once per file. */
const metaKey = (id: string) => ['attachment', id] as const;
const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

let uploadSeq = 0;

/**
 * Tệp đính kèm: a drop zone (which is also the file picker), the files by name and size, each name a download link,
 * and previews of images and PDFs. The primary, collaborators and managers add files; anyone else sees them. The
 * published file metadata names no uploader, so the list does not say who added a file.
 */
export function Attachments({ task, project, writer }: { task: Task; project: Project | null; writer: DrawerWriter }) {
  const { viewer, online, lang, api } = useProjects();
  const tr = useT();
  const qc = useQueryClient();
  const report = useReportFailure();
  const headingId = useId();
  const verdict = can('attachments', { viewer, project, task, online });
  const lock: TextKey | null = verdict.ok ? null : verdict.reason;
  const [uploads, setUploads] = useState<{ key: string; name: string }[]>([]);
  const [over, setOver] = useState(false);
  const taskId = useRef(task.id);
  taskId.current = task.id;

  /** Every file is uploaded, then one write adds all that arrived to the task as it stands by then. */
  const addFiles = async (files: File[]) => {
    if (lock || files.length === 0) return;
    const entries = files.map((f) => ({ key: `upload-${++uploadSeq}`, name: f.name }));
    setUploads((u) => [...u, ...entries]);
    try {
      const results = await Promise.allSettled(files.map((f) => api.upload(f)));
      const added: string[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled') {
          qc.setQueryData<Attachment>(metaKey(r.value.id), r.value);
          added.push(r.value.id);
        } else {
          report(r.reason, taskId.current);
        }
      }
      if (added.length === 0) return;
      await writer.run('attachments', (from) =>
        api.updateTask(from, { attachments: [...from.attachments, ...added.filter((id) => !from.attachments.includes(id))] }));
    } finally {
      const done = new Set(entries.map((e) => e.key));
      setUploads((u) => u.filter((x) => !done.has(x.key)));
    }
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!over) setOver(true);
  };
  const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    setOver(false);
  };
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    setOver(false);
    void addFiles(Array.from(e.dataTransfer.files));
  };

  const count = task.attachments.length;
  return (
    <div
      className="field-row stacked attachments"
      data-field="attachments"
      data-locked={lock ? '' : undefined}
      data-rolled-back={writer.rolledBack === 'attachments' ? '' : undefined}
      onAnimationEnd={() => writer.settled('attachments')}
    >
      <div className="field-label">
        <h3 id={headingId}>{tr('attachments')}</h3>
        {count > 0 && <span className="field-count">{formatCount(count, lang)}</span>}
        {lock && (
          <Tooltip text={tr(lock)} locale={lang}>
            <span className="lock-hint" tabIndex={0} role="img" aria-label={tr(lock)}><LockIcon size={12} /></span>
          </Tooltip>
        )}
      </div>
      {!lock && (
        <label className="dropzone" data-part="dropzone" data-over={over ? '' : undefined} onDragEnter={onDragOver} onDragOver={onDragOver}
          onDragLeave={onDragLeave} onDrop={onDrop}>
          <Paperclip size={16} />
          <span className="dropzone-text">{tr('dropFiles')}</span>
          <input
            type="file"
            multiple
            className="dropzone-input"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = '';
              void addFiles(files);
            }}
          />
        </label>
      )}
      {count === 0 && uploads.length === 0
        ? lock && <p className="field-empty">{tr('noAttachments')}</p>
        : (
          <ul className="file-list" aria-labelledby={headingId}>
            {task.attachments.map((id) => <FileRow key={id} id={id} fallbackName={task.fileNames[id] ?? null} />)}
            {uploads.map((u) => (
              <li key={u.key} className="file-row" data-uploading="" aria-busy="true">
                <FileIcon size={16} />
                <span className="file-name-text">{u.name}</span>
                <span className="sr-only">{tr('uploading', { name: u.name })}</span>
                <span className="upload-bar" aria-hidden="true"><span /></span>
              </li>
            ))}
          </ul>
        )}
      {count > 0 && <Previews ids={task.attachments} />}
    </div>
  );
}

function useMeta(id: string) {
  const { api } = useProjects();
  return useQuery({ queryKey: metaKey(id), queryFn: () => api.attachment(id), staleTime: Infinity });
}

function FileRow({ id, fallbackName }: { id: string; fallbackName: string | null }) {
  const { api, lang } = useProjects();
  const meta = useMeta(id);
  const name = meta.data?.name ?? fallbackName ?? id;
  const kind = kindOf(meta.data?.type);
  return (
    <li className="file-row" data-file={id}>
      {kind === 'image' ? <ImageIcon size={16} /> : kind === 'pdf' ? <FileText size={16} /> : <FileIcon size={16} />}
      <Tooltip text={name} locale={lang}>
        <a className="file-name" href={api.fileUrl(id)} download={name}>{name}</a>
      </Tooltip>
      {meta.data && <span className="file-size">{formatBytes(meta.data.size, lang)}</span>}
    </li>
  );
}

/** Images as a grid of thumbnails, then each PDF in a frame, in the task's order. */
function Previews({ ids }: { ids: string[] }) {
  return (
    <div className="previews">
      <div className="preview-grid">{ids.map((id) => <Preview key={id} id={id} want="image" />)}</div>
      {ids.map((id) => <Preview key={id} id={id} want="pdf" />)}
    </div>
  );
}

/**
 * One file's preview. The published download always answers as an attachment, which an `<iframe>` would save rather
 * than show, so the file is read as a Blob and shown from an object URL, which is given back when the preview goes.
 */
function Preview({ id, want }: { id: string; want: 'image' | 'pdf' }) {
  const { api } = useProjects();
  const meta = useMeta(id);
  const kind = kindOf(meta.data?.type);
  const shown = kind === want;
  const [src, setSrc] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (!shown) return;
    let live = true;
    let url: string | null = null;
    api.fileBlob(id).then((blob) => {
      if (!live) return;
      // A frame shows what its URL's type says, so a PDF's is pinned to PDF whatever the response called it.
      try {
        url = URL.createObjectURL(kind === 'pdf' && blob.type !== 'application/pdf' ? new Blob([blob], { type: 'application/pdf' }) : blob);
      } catch {
        setBroken(true);
        return;
      }
      setSrc(url);
    }, () => {
      if (live) setBroken(true);
    });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
      setSrc(null);
    };
  }, [api, id, shown, kind]);

  if (!shown || broken || !meta.data) return null;
  const name = meta.data.name;
  if (kind === 'image') {
    return (
      <figure className="preview preview-image" data-preview={id}>
        {src ? <img src={src} alt={name} onError={() => setBroken(true)} /> : <span className="af-skeleton preview-skeleton" aria-hidden="true" />}
      </figure>
    );
  }
  return (
    <figure className="preview preview-pdf" data-preview={id}>
      {src ? <iframe src={src} title={name} /> : <span className="af-skeleton preview-skeleton" aria-hidden="true" />}
    </figure>
  );
}
