import type { SlotFolder } from '@reflexify/agentflow-sdk';

export type FieldKind = 'text' | 'email' | 'date' | 'datetime' | 'number' | 'integer' | 'boolean' | 'choice' | 'folder' | 'unsupported';

export interface FieldSpec {
  key: string;
  label: string;
  description?: string;
  kind: FieldKind;
  required: boolean;
  options?: { value: string; label: string }[];
  /** What a folder field's launch reads, as the workflow's input contract says. */
  folder?: SlotFolder;
}

/** A field of the workflow's input contract, as far as a form reads it. */
export interface ContractSlot {
  key: string;
  title?: string | null;
  required?: boolean;
  folder?: SlotFolder | null;
}

type Schema = Record<string, unknown>;
const isObject = (v: unknown): v is Schema => typeof v === 'object' && v !== null && !Array.isArray(v);

function primaryType(prop: Schema): string | undefined {
  const t = prop.type;
  if (typeof t === 'string') return t;
  if (Array.isArray(t)) return t.find((x) => x !== 'null') as string | undefined;
  return undefined;
}

type Option = { value: string; label: string };

// Options are rendered in a keyed each block, where a repeated value throws.
function choice(options: Option[]): Pick<FieldSpec, 'kind' | 'options'> {
  const labels = new Map<string, string>();
  for (const o of options) if (!labels.has(o.value)) labels.set(o.value, o.label);
  return { kind: 'choice', options: [...labels].map(([value, label]) => ({ value, label })) };
}

function classifyProp(prop: Schema): Pick<FieldSpec, 'kind' | 'options'> {
  if (Array.isArray(prop.oneOf)) {
    // A `const: null` branch means "no selection", which the empty option already offers.
    const branches = prop.oneOf.filter((b) => !(isObject(b) && b.const === null));
    const options: Option[] = [];
    for (const b of branches) {
      if (!isObject(b) || typeof b.const !== 'string') return { kind: 'unsupported' };
      options.push({ value: b.const, label: typeof b.title === 'string' ? b.title : b.const });
    }
    return options.length > 0 ? choice(options) : { kind: 'unsupported' };
  }
  // Checked before the type, so a number enum is not offered as a free number.
  if (Array.isArray(prop.enum)) {
    if (!prop.enum.every((e) => typeof e === 'string' || e === null)) return { kind: 'unsupported' };
    const members = prop.enum.filter((e): e is string => typeof e === 'string');
    return members.length > 0 ? choice(members.map((e) => ({ value: e, label: e }))) : { kind: 'unsupported' };
  }
  const type = primaryType(prop);
  if (type === 'string') {
    switch (prop.format) {
      case undefined:
        return { kind: 'text' };
      case 'date':
        return { kind: 'date' };
      case 'date-time':
        return { kind: 'datetime' };
      case 'email':
        return { kind: 'email' };
      default:
        return { kind: 'unsupported' };
    }
  }
  if (type === 'number') return { kind: 'number' };
  if (type === 'integer') return { kind: 'integer' };
  if (type === 'boolean') return { kind: 'boolean' };
  return { kind: 'unsupported' };
}

// The server's own test for a field of several files; a single file is `{type: 'string', format: 'attachment'}`.
function holdsFiles(prop: unknown): boolean {
  return isObject(prop) && prop.type === 'array' && isObject(prop.items) && prop.items.type === 'string' && prop.items.format === 'attachment';
}

/** Whether a form has a field of several files, the only kind a workflow's contract can give a folder. */
export function takesFiles(schema: unknown): boolean {
  return isObject(schema) && isObject(schema.properties) && Object.values(schema.properties).some(holdsFiles);
}

const TOP_LEVEL_SCOPE = /^#\/properties\/([^/]+)$/;

function controlKeys(node: unknown, out: string[] = []): string[] {
  if (!isObject(node)) return out;
  if (node.type === 'Control' && typeof node.scope === 'string') {
    const key = TOP_LEVEL_SCOPE.exec(node.scope)?.[1];
    if (key !== undefined) out.push(key);
  }
  if (Array.isArray(node.elements)) for (const child of node.elements) controlKeys(child, out);
  return out;
}

// The form designer records top-level field order only in the layout (a JSONForms UI schema),
// so the layout's controls come first; its sections are not rendered.
// `slots` is the contract of the workflow the form starts: a field of several files it gives a folder is a folder field.
export function fieldsOf(schema: unknown, uiSchema?: unknown, slots: readonly ContractSlot[] = []): FieldSpec[] {
  if (!isObject(schema) || !isObject(schema.properties)) return [];
  const props = schema.properties;
  const required = new Set(Array.isArray(schema.required) ? (schema.required as string[]) : []);
  const own = (k: unknown): k is string => typeof k === 'string' && Object.hasOwn(props, k);
  const order = Array.isArray(schema['x-order']) ? schema['x-order'].filter(own) : [];
  const folders = new Map(slots.flatMap((slot) => (slot.folder ? [[slot.key, slot.folder] as const] : [])));
  const keys = [...new Set([...controlKeys(uiSchema).filter(own), ...order, ...Object.keys(props)])];
  return keys.map((key) => {
    const prop = isObject(props[key]) ? (props[key] as Schema) : {};
    const folder = holdsFiles(prop) ? folders.get(key) : undefined;
    const spec: FieldSpec = {
      key,
      label: typeof prop.title === 'string' ? prop.title : key,
      required: required.has(key),
      ...(folder ? { kind: 'folder', folder } : classifyProp(prop)),
    };
    if (typeof prop.description === 'string') spec.description = prop.description;
    return spec;
  });
}

/** The fields of a start that binds no form: the contract types no parameter, but a folder field needs only what its slot says. */
export function folderFieldsOf(slots: readonly ContractSlot[]): FieldSpec[] {
  return slots.flatMap((slot) =>
    slot.folder ? [{ key: slot.key, label: slot.title || slot.key, kind: 'folder' as const, required: slot.required === true, folder: slot.folder }] : [],
  );
}

const pad = (n: number) => String(n).padStart(2, '0');
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function initialValues(fields: FieldSpec[], source: unknown): Record<string, unknown> {
  const src = isObject(source) ? source : {};
  const values: Record<string, unknown> = {};
  for (const f of fields) {
    const v = src[f.key];
    if (f.kind === 'boolean') values[f.key] = v === true;
    else if (f.kind === 'datetime') values[f.key] = typeof v === 'string' ? toLocalInput(v) : '';
    else if (f.kind === 'unsupported') values[f.key] = v;
    // A folder is chosen in the form, never carried in: a set feeds one launch.
    else if (f.kind === 'folder') values[f.key] = null;
    else values[f.key] = v === undefined || v === null ? '' : v;
  }
  return values;
}

const isEmpty = (v: unknown) => v === undefined || v === null || v === '';

export function toPayload(fields: FieldSpec[], values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.key];
    if (f.kind === 'boolean') {
      out[f.key] = v === true;
      continue;
    }
    if (isEmpty(v)) continue;
    if (f.kind === 'number' || f.kind === 'integer') out[f.key] = Number(v);
    else if (f.kind === 'datetime') out[f.key] = new Date(String(v)).toISOString();
    else out[f.key] = v;
  }
  return out;
}

export function missingRequired(fields: FieldSpec[], values: Record<string, unknown>): string[] {
  return fields.filter((f) => f.required && f.kind !== 'boolean' && f.kind !== 'unsupported' && isEmpty(values[f.key])).map((f) => f.key);
}

/** The required fields the form cannot take a value for. A folder field is one when its source could not be loaded. */
export function blockingFields(fields: FieldSpec[], foldersUnavailable = false): FieldSpec[] {
  return fields.filter((f) => f.required && (f.kind === 'unsupported' || (foldersUnavailable && f.kind === 'folder')));
}

export function errorsByField(fieldErrors: { path: string; message: string }[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of fieldErrors ?? []) {
    const key = e.path.replace(/^\//, '').split('/')[0] ?? '';
    out[key] ??= e.message;
  }
  return out;
}
