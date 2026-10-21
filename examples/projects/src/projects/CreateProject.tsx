import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type MutableRefObject } from 'react';
import { flushSync } from 'react-dom';
import { isProjectsError } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { refusalText } from '../data/failure.js';
import { useCreateProject, usePeople, useProjectsList, useUnits, type CreateOutcome } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { Confirm, Dialog, PersonPicker, Tooltip, type Person as KitPerson } from '../kit/elements.js';
import { hueOf, initials } from '../model/format.js';
import { canCreateProject } from '../model/roles.js';
import { TEMPLATES, templateSections, type TemplateKey, type TemplateSection } from '../model/templates.js';
import type { Project, ProjectStatus, Section } from '../model/types.js';
import { AlertTriangle, ChevronDown, LockIcon } from '../shared/icons.js';
import { useNavigate } from '../shell/RouteContext.js';
import { DEFAULT_QUERY, routePath } from '../shell/route.js';
import type { TextKey } from '../text.js';
import { SectionsEditor } from './SectionsEditor.js';

type Choice = TemplateKey | 'reuse';
/** A press that has not settled by then shows its spinner; a quicker one never flashes it. */
const SPINNER_MS = 400;
/** How many of a template's sections its card names. */
const PREVIEWED = 3;
const ALL_STATUSES: ProjectStatus[] = ['active', 'paused', 'closed'];

const bySectionOrder = (a: Section, b: Section) => {
  if (a.position === null && b.position === null) return a.name.localeCompare(b.name, 'vi');
  if (a.position === null) return 1;
  if (b.position === null) return -1;
  return a.position - b.position || a.name.localeCompare(b.name, 'vi');
};
const same = (a: TemplateSection[], b: TemplateSection[]) =>
  a.length === b.length && a.every((s, i) => s.name === b[i]!.name && s.description === b[i]!.description);

/**
 * Tạo project: a modal over the project list. It closes once the project and every section exist, and opens the new
 * project. When the project exists but a section does not, it stays to say which and offers to try them again.
 */
export function CreateProject(p: { open: boolean; onClose(): void }) {
  const { lang } = useProjects();
  const tr = useT();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [session, setSession] = useState(0);
  // Once the project exists and only what failed is left to say, the dialog narrows to that message.
  const [unsaved, setUnsaved] = useState(false);
  // The form's own answer to a dismiss: it may be busy, or hold what someone typed.
  const dismissRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (p.open) return;
    setDone(false);
    setUnsaved(false);
    setSession((n) => n + 1);
  }, [p.open]);
  const open = p.open && !done;

  // No toast: the new project's page says it exists.
  const finish = (project: Project) => {
    // The dialog is modal: the page under it can take focus only once it has closed.
    flushSync(() => setDone(true));
    p.onClose();
    const path = routePath({ screen: 'project', project: project.id, view: DEFAULT_QUERY });
    setTimeout(() => navigate(path), 0);
  };

  return (
    <div className="create-project-modal" data-step={unsaved ? 'unsaved' : undefined}>
      <Dialog open={open} heading={tr('newProject')} locale={lang} onClose={() => (dismissRef.current ? dismissRef.current() : p.onClose())}>
        {p.open && <CreateProjectForm key={session} dismissRef={dismissRef} onClose={p.onClose} onFinish={finish} onUnsaved={() => setUnsaved(true)} />}
      </Dialog>
    </div>
  );
}

function CreateProjectForm(p: {
  dismissRef: MutableRefObject<(() => void) | null>; onClose(): void; onFinish(project: Project): void; onUnsaved(): void;
}) {
  const { api, viewer, online, lang, people, labels } = useProjects();
  const tr = useT();
  const qc = useQueryClient();
  const everyone = usePeople();
  const units = useUnits();
  const create = useCreateProject();
  const ids = {
    name: useId(), description: useId(), unit: useId(), managers: useId(), members: useId(), template: useId(), reuse: useId(),
    sections: useId(), reason: useId(), cancelReason: useId(), creatorNote: useId(),
  };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [managers, setManagers] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [choice, setChoice] = useState<Choice>('blank');
  const [sections, setSections] = useState<TemplateSection[]>([]);
  // The list as the last template or project left it, to tell whether the creator has changed it since.
  const [baseline, setBaseline] = useState<TemplateSection[]>([]);
  const [reuseFrom, setReuseFrom] = useState('');
  const [reuse, setReuse] = useState<{ state: 'idle' | 'loading' } | { state: 'error'; reason: string }>({ state: 'idle' });
  const reuseCall = useRef(0);
  const [replacing, setReplacing] = useState<{ apply(): void; cancel?(): void } | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<CreateOutcome | null>(null);

  // Locked in the same tick as the press, before React has rendered: a second press finds it set.
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!busy) return setSlow(false);
    const timer = setTimeout(() => setSlow(true), SPINNER_MS);
    return () => clearTimeout(timer);
  }, [busy]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  // The dialog puts focus on its own close button as it opens, so the name takes it afterwards.
  const nameRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    let frame = 0;
    const focus = () => nameRef.current?.focus({ preventScroll: true });
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(focus); });
    return () => cancelAnimationFrame(frame);
  }, []);

  // The form's fields give way to what was not saved, so focus goes on to Thử lại rather than to the page.
  const outcomeForm = useRef<HTMLFormElement | null>(null);
  const hasOutcome = outcome !== null;
  useEffect(() => {
    if (hasOutcome) outcomeForm.current?.querySelector<HTMLElement>('.qc-submit')?.focus({ preventScroll: true });
  }, [hasOutcome]);

  const me = people.get(viewer.id) ?? { id: viewer.id, name: viewer.id, email: null };
  const kitPeople = useMemo<KitPerson[]>(
    () => (everyone.data ?? []).map((person) => ({ id: person.id, name: person.name, email: person.email })),
    [everyone.data],
  );
  const managerChoices = useMemo(() => kitPeople.filter((x) => x.id !== viewer.id), [kitPeople, viewer.id]);
  const memberChoices = useMemo(() => kitPeople.filter((x) => x.id !== viewer.id && !managers.includes(x.id)), [kitPeople, viewer.id, managers]);
  const projects = useProjectsList(ALL_STATUSES);
  const reusable = useMemo(
    () => (projects.data ?? [])
      .filter((pr) => pr.managers.includes(viewer.id) || pr.members.includes(viewer.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    [projects.data, viewer.id],
  );
  const noReuse = !!projects.data && reusable.length === 0;

  const dirty = !!(name.trim() || description.trim() || unit || managers.length || members.length || sections.length);
  const edited = !same(sections, baseline);

  // Read through a ref, as the dialog's close listener is set once.
  const dismiss = () => {
    if (inFlight.current) return;
    if (outcome) return p.onClose();
    if (dirty) setDiscarding(true);
    else p.onClose();
  };
  const dismissNow = useRef(dismiss);
  dismissNow.current = dismiss;
  const { dismissRef } = p;
  useEffect(() => {
    dismissRef.current = () => dismissNow.current();
    return () => { dismissRef.current = null; };
  }, [dismissRef]);

  const replaceWith = (next: TemplateSection[], apply: () => void, cancel?: () => void) => {
    const go = () => {
      apply();
      setSections(next);
      setBaseline(next);
    };
    if (edited) setReplacing({ apply: go, cancel });
    else go();
  };

  const choose = (key: Choice) => {
    if (key === choice) return;
    if (key === 'reuse') {
      if (noReuse) return;
      setChoice('reuse');
      return;
    }
    replaceWith(templateSections(key, lang), () => {
      setChoice(key);
      setReuseFrom('');
      setReuse({ state: 'idle' });
    });
  };

  const reuseProject = async (id: string) => {
    const call = ++reuseCall.current;
    const before = reuseFrom;
    setReuseFrom(id);
    if (!id) return setReuse({ state: 'idle' });
    setReuse({ state: 'loading' });
    try {
      const read = await qc.fetchQuery({ queryKey: keys.sections(id), queryFn: () => api.sections(id) });
      if (!mounted.current || call !== reuseCall.current) return;
      setReuse({ state: 'idle' });
      const next = [...read].sort(bySectionOrder).map((s) => ({ name: s.name, description: s.description }));
      replaceWith(next, () => undefined, () => setReuseFrom(before));
    } catch (e) {
      if (!mounted.current || call !== reuseCall.current) return;
      setReuse({ state: 'error', reason: reasonOf(e, tr, 'reuseFailed') });
    }
  };

  const verdict = canCreateProject(viewer, online);
  const missing: TextKey | null = !verdict.ok ? verdict.reason
    : !name.trim() ? 'projectNeedsName'
    : sections.some((s) => !s.name.trim()) ? 'sectionNeedsName'
    : null;
  const lockReason: TextKey | null = busy ? null : missing;

  const submit = async () => {
    if (inFlight.current || missing !== null) return;
    inFlight.current = true;
    setBusy(true);
    setRefusal(null);
    try {
      const result = await create.run(
        { name: name.trim(), description: description.trim(), unit: unit || null, managers: [viewer.id, ...managers], members },
        sections.map((s) => ({ name: s.name.trim(), description: s.description.trim() })),
      );
      inFlight.current = false;
      if (result.failed.length === 0) return p.onFinish(result.project);
      if (mounted.current) {
        setOutcome(result);
        p.onUnsaved();
      }
    } catch (e) {
      inFlight.current = false;
      if (mounted.current) setRefusal(reasonOf(e, tr, 'projectCreateFailed'));
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const retry = async () => {
    if (inFlight.current || !online) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const result = await create.retry();
      inFlight.current = false;
      if (result.failed.length === 0) return p.onFinish(result.project);
      if (mounted.current) setOutcome(result);
    } catch (e) {
      inFlight.current = false;
      if (!isProjectsError(e)) console.error(e);
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!outcome) void submit();
  };

  const waitReason = busy ? tr('createProjectWait') : '';
  const pressButton = (opts: { label: string; busyLabel: string; lockedBy: string | null; onPress?(): void; submit?: boolean }) => (
    <>
      {/* Always inside the tooltip, which shows nothing without text, so the button is one element from press to answer. */}
      <Tooltip text={opts.lockedBy ?? ''} locale={lang}>
        <button
          type={opts.submit ? 'submit' : 'button'}
          className="af-button primary qc-submit"
          aria-disabled={busy || opts.lockedBy ? 'true' : undefined}
          aria-busy={busy ? 'true' : undefined}
          aria-describedby={opts.lockedBy ? ids.reason : undefined}
          data-slow={slow ? 'true' : undefined}
          onClick={opts.onPress}
        >
          <span className="qc-submit-label">{opts.label}</span>
          <span className="qc-submit-label" data-part="creating" aria-hidden={slow ? undefined : 'true'}>
            <span className="qc-spinner" aria-hidden="true" />
            {opts.busyLabel}
          </span>
        </button>
      </Tooltip>
      {opts.lockedBy && <span id={ids.reason} className="sr-only">{opts.lockedBy}</span>}
    </>
  );

  if (outcome) {
    const retryLock = !online ? tr('offlineLocked') : null;
    return (
      <form className="cp-form" ref={outcomeForm} onSubmit={onSubmit} noValidate aria-busy={busy ? 'true' : undefined}>
        <div className="af-banner warning cp-unsaved" role="alert">
          <AlertTriangle size={16} />
          <div className="cp-unsaved-body">
            <p className="cp-unsaved-title">{tr('partlyCreated')}</p>
            <ul className="cp-unsaved-list">
              {outcome.failed.map((f, i) => (
                <li key={`${i}:${f.name}`}>
                  <span className="cp-unsaved-name">{f.name}</span>
                  {f.reason && <span className="cp-unsaved-reason">{f.reason}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="qc-actions">
          <Tooltip text={waitReason} locale={lang}>
            <button
              type="button"
              className="af-button secondary"
              aria-disabled={busy ? 'true' : undefined}
              aria-describedby={busy ? ids.cancelReason : undefined}
              onClick={() => { if (!inFlight.current) p.onFinish(outcome.project); }}
            >
              {tr('openProject')}
            </button>
          </Tooltip>
          {busy && <span id={ids.cancelReason} className="sr-only">{waitReason}</span>}
          {pressButton({ label: tr('retry'), busyLabel: tr('creating'), lockedBy: retryLock, onPress: () => void retry() })}
        </div>
      </form>
    );
  }

  return (
    <form className="cp-form" onSubmit={onSubmit} noValidate aria-busy={busy ? 'true' : undefined}>
      {refusal && <div className="af-banner danger qc-refusal" role="alert">{refusal}</div>}
      <div className="cp-columns">
        <div className="cp-fields">
          <div className="qc-field" data-field="name">
            <label className="qc-label" htmlFor={ids.name}>{tr('projectName')}</label>
            <input
              id={ids.name}
              ref={nameRef}
              className="qc-input qc-title"
              value={name}
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="qc-field" data-field="description">
            <label className="qc-label" htmlFor={ids.description}>{tr('description')}</label>
            <textarea
              id={ids.description}
              className="qc-input cp-description"
              rows={3}
              value={description}
              placeholder={tr('descriptionPlaceholder')}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="qc-field" data-field="unit">
            <label className="qc-label" htmlFor={ids.unit}>{tr('unit')}</label>
            <span className="qc-select">
              <select
                id={ids.unit}
                className="qc-select-control"
                value={unit}
                aria-busy={units.isPending ? 'true' : undefined}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="">{tr('noUnit')}</option>
                {/* Opened before the list arrives, the select says it is still coming rather than that there is none. */}
                {units.isPending && <option value="" disabled data-part="units-loading">{tr('loading')}</option>}
                {(units.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <ChevronDown size={14} className="qc-select-chevron" />
            </span>
            {units.isError && <p className="cp-help" data-tone="danger">{tr('unitsFailed')}</p>}
          </div>
          <div className="qc-field" data-field="managers" role="group" aria-labelledby={ids.managers}>
            <span className="qc-label" id={ids.managers}>{tr('managers')}</span>
            <div className="cp-people">
              <span className="person-chip cp-creator" data-part="creator" aria-describedby={ids.creatorNote}>
                <span className="af-avatar" data-hue={hueOf(me.id)} aria-hidden="true">{initials(me.name)}</span>
                <span className="person-name">{me.name}</span>
                <LockIcon size={12} />
              </span>
              <PersonPicker
                people={managerChoices}
                value={managers}
                multiple
                placeholder={tr('addPeople')}
                label={tr('managers')}
                loading={!everyone.data}
                locale={lang}
                onChange={({ value }) => {
                  const next = Array.isArray(value) ? value : value ? [value] : [];
                  setManagers(next);
                  setMembers((list) => list.filter((id) => !next.includes(id)));
                }}
              />
            </div>
            <p className="cp-help" id={ids.creatorNote}>{tr('creatorIsManager')}</p>
          </div>
          <div className="qc-field" data-field="members" role="group" aria-labelledby={ids.members}>
            <span className="qc-label" id={ids.members}>{tr('members')}</span>
            <PersonPicker
              people={memberChoices}
              value={members}
              multiple
              placeholder={tr('addPeople')}
              label={tr('members')}
              loading={!everyone.data}
              locale={lang}
              onChange={({ value }) => setMembers(Array.isArray(value) ? value : value ? [value] : [])}
            />
          </div>
        </div>
        <div className="cp-structure">
          <div className="qc-field" data-field="template">
            <span className="qc-label" id={ids.template}>{tr('template')}</span>
            <TemplatePicker labelledBy={ids.template} value={choice} reuseLocked={noReuse} onChoose={choose} />
          </div>
          {choice === 'reuse' && (
            <div className="qc-field" data-field="reuse">
              <label className="qc-label" htmlFor={ids.reuse}>{tr('reuseFrom')}</label>
              <span className="qc-select">
                <select id={ids.reuse} className="qc-select-control" value={reuseFrom} onChange={(e) => void reuseProject(e.target.value)}>
                  <option value="" disabled>{tr('quickCreateChooseProject')}</option>
                  {reusable.map((pr) => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
                </select>
                <ChevronDown size={14} className="qc-select-chevron" />
              </span>
            </div>
          )}
          <div className="qc-field cp-sections" data-field="sections">
            <span className="qc-label" id={ids.sections}>
              {tr('sections')}
              {sections.length > 0 && <span className="cp-count">{sections.length}</span>}
            </span>
            {reuse.state === 'loading' ? (
              <div className="state loading cp-sections-loading" role="status" aria-busy="true" aria-label={tr('loading')}>
                {[0, 1, 2].map((i) => <span key={i} className="af-skeleton bone cp-bone" />)}
              </div>
            ) : (
              <>
                {reuse.state === 'error' && (
                  <div className="af-banner danger qc-refusal cp-reuse-error" role="alert">
                    <span>{reuse.reason}</span>
                    <button type="button" className="af-button secondary sm" onClick={() => void reuseProject(reuseFrom)}>{tr('retry')}</button>
                  </div>
                )}
                <SectionsEditor value={sections} onChange={setSections} labels={labels} lang={lang} />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="qc-actions">
        <Tooltip text={waitReason} locale={lang}>
          <button
            type="button"
            className="af-button secondary"
            aria-disabled={busy ? 'true' : undefined}
            aria-describedby={busy ? ids.cancelReason : undefined}
            onClick={dismiss}
          >
            {tr('cancel')}
          </button>
        </Tooltip>
        {busy && <span id={ids.cancelReason} className="sr-only">{waitReason}</span>}
        {pressButton({ label: tr('createProject'), busyLabel: tr('creating'), lockedBy: lockReason ? tr(lockReason) : null, submit: true })}
      </div>
      <Confirm
        open={discarding}
        heading={tr('discardChanges')}
        confirmLabel={tr('discard')}
        locale={lang}
        strings={{ cancel: tr('goBack') }}
        onConfirm={() => {
          setDiscarding(false);
          p.onClose();
        }}
        onCancel={() => setDiscarding(false)}
      />
      <Confirm
        open={!!replacing}
        heading={tr('replaceSections')}
        message={tr('replaceSectionsMessage')}
        confirmLabel={tr('confirmReplaceSections')}
        locale={lang}
        strings={{ cancel: tr('goBack') }}
        onConfirm={() => {
          replacing?.apply();
          setReplacing(null);
        }}
        onCancel={() => {
          replacing?.cancel?.();
          setReplacing(null);
        }}
      />
    </form>
  );
}

/**
 * The templates as a row of cards, one radio group: each card names the template and its first sections. The arrow
 * keys move the choice, as in any radio group.
 */
function TemplatePicker(p: { labelledBy: string; value: Choice; reuseLocked: boolean; onChoose(key: Choice): void }) {
  const { lang } = useProjects();
  const tr = useT();
  const base = useId();
  const lockId = `${base}-lock`;
  const choices = useMemo(() => [
    ...TEMPLATES.map((tpl) => {
      const names = tpl.sections.map((s) => s[lang].name);
      const shown = names.slice(0, PREVIEWED).join(' · ');
      const more = names.length - PREVIEWED;
      return { key: tpl.key as Choice, name: tpl.name[lang], preview: names.length ? (more > 0 ? `${shown} · +${more}` : shown) : tr('templateBlankHint') };
    }),
    { key: 'reuse' as Choice, name: tr('reuseProject'), preview: tr('reuseProjectHint') },
  ], [lang, tr]);
  const enabled = choices.filter((c) => !(c.key === 'reuse' && p.reuseLocked));
  const group = useRef<HTMLDivElement>(null);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const by = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const edge = e.key === 'Home' ? 0 : e.key === 'End' ? enabled.length - 1 : null;
    if (by === 0 && edge === null) return;
    e.preventDefault();
    const at = enabled.findIndex((c) => c.key === p.value);
    const next = enabled[edge ?? (at + by + enabled.length) % enabled.length]!;
    p.onChoose(next.key);
    group.current?.querySelector<HTMLElement>(`[data-template="${next.key}"]`)?.focus();
  };

  return (
    <div className="cp-templates" role="radiogroup" aria-labelledby={p.labelledBy} ref={group} onKeyDown={onKey}>
      {choices.map((c) => {
        const checked = c.key === p.value;
        const locked = c.key === 'reuse' && p.reuseLocked;
        const card = (
          <button
            key={c.key}
            type="button"
            role="radio"
            className="cp-template"
            data-template={c.key}
            aria-checked={checked}
            aria-labelledby={`${base}-${c.key}-name`}
            aria-describedby={locked ? `${base}-${c.key}-preview ${lockId}` : `${base}-${c.key}-preview`}
            aria-disabled={locked ? 'true' : undefined}
            tabIndex={checked ? 0 : -1}
            onClick={() => { if (!locked) p.onChoose(c.key); }}
          >
            <span className="cp-template-name" id={`${base}-${c.key}-name`}>{c.name}</span>
            <span className="cp-template-preview" id={`${base}-${c.key}-preview`}>{c.preview}</span>
          </button>
        );
        return locked ? (
          <Tooltip key={c.key} text={tr('noProjects')} locale={lang} className="cp-template-tip">{card}</Tooltip>
        ) : card;
      })}
      {p.reuseLocked && <span id={lockId} className="sr-only">{tr('noProjects')}</span>}
    </div>
  );
}

/** What a failed write says: the server's sentence when it gave one. */
function reasonOf(e: unknown, tr: (key: TextKey) => string, fallback: TextKey): string {
  if (isProjectsError(e, 'offline')) return tr('offlineLocked');
  const refusal = refusalText(e, tr);
  if (refusal) return refusal;
  if (!isProjectsError(e)) console.error(e);
  return tr(fallback);
}
