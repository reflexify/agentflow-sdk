import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type {
  AccessLostDetail, RecordCreatedDetail, RecordSelectDetail, RequestFailedDetail, SessionReadyDetail, Strings,
  TaskClaimedDetail, TaskReleasedDetail, TaskSelectDetail, TaskSubmittedDetail, WorkflowStartedDetail,
} from './dist/index.js';
import type { KitStrings, MenuItem, Person, ToastInput } from './dist/kit/index.js';

type Base = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
type On<T> = (event: CustomEvent<T>) => void;
type Kit<T extends HTMLElement = HTMLElement> = DetailedHTMLProps<HTMLAttributes<T>, T> & {
  part?: string;
  class?: string;
  locale?: string | null;
  strings?: Partial<KitStrings> | null;
};

export interface AfToastElement extends HTMLElement {
  show(input: ToastInput): string;
  dismiss(id: string): void;
}
/** The editor's element. Its Tiptap instance is not part of the contract, and has no type here. */
export interface AfRichEditorElement extends HTMLElement {}
export interface DialogCloseDetail { reason: 'escape' | 'outside' | 'close-button' }
export interface ConfirmCancelDetail { reason: 'escape' | 'close-button' }
export interface PopoverCloseDetail { reason: 'escape' | 'outside' }
export interface MenuSelectDetail { id: string }
export interface ToastActionDetail { toast: string; action: string }
export interface DateChangeDetail { value: string | null }
export interface PersonChangeDetail { value: string | string[] | null }
export interface PersonSearchDetail { query: string }
export interface RichEditorChangeDetail { value: string }

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'agentflow-provider': Base & {
        'base-path'?: string;
        locale?: 'en' | 'vi';
        strings?: Strings;
        fetchImpl?: typeof fetch;
        'onsession-ready'?: On<SessionReadyDetail>;
        'onsigned-out'?: On<Record<string, never>>;
        'onaccess-lost'?: On<AccessLostDetail>;
        'onrequest-failed'?: On<RequestFailedDetail>;
      };
      'agentflow-task-inbox': Base & {
        view?: 'all' | 'mine' | 'claimable';
        'page-size'?: number;
        'ontask-select'?: On<TaskSelectDetail>;
      };
      'agentflow-task-detail': Base & {
        'entity-id': string;
        'record-id': string;
        'ontask-claimed'?: On<TaskClaimedDetail>;
        'ontask-released'?: On<TaskReleasedDetail>;
        'ontask-submitted'?: On<TaskSubmittedDetail>;
      };
      'agentflow-record-table': Base & {
        'entity-id': string;
        columns?: string;
        'page-size'?: number;
        filter?: object;
        'onrecord-select'?: On<RecordSelectDetail>;
        'onrecord-created'?: On<RecordCreatedDetail>;
      };
      'agentflow-start-form': Base & {
        'workflow-id'?: string;
        'onworkflow-started'?: On<WorkflowStartedDetail>;
      };
      'af-dialog': Kit & {
        open?: boolean | null;
        heading?: string | null;
        onclose?: On<DialogCloseDetail>;
      };
      'af-confirm': Kit & {
        open?: boolean | null;
        heading?: string | null;
        message?: string | null;
        'confirm-label'?: string | null;
        danger?: boolean | null;
        impact?: string | null;
        busy?: boolean | null;
        onconfirm?: On<Record<string, never>>;
        oncancel?: On<ConfirmCancelDetail>;
      };
      'af-menu': Kit & {
        items?: MenuItem[] | null;
        label?: string | null;
        onselect?: On<MenuSelectDetail>;
      };
      'af-popover': Kit & {
        open?: boolean | null;
        placement?: string | null;
        onclose?: On<PopoverCloseDetail>;
      };
      'af-tooltip': Kit & {
        text?: string | null;
      };
      'af-toast': Kit<AfToastElement> & {
        onaction?: On<ToastActionDetail>;
      };
      'af-date': Kit & {
        value?: string | null;
        min?: string | null;
        max?: string | null;
        clearable?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        disabled?: boolean | null;
        onchange?: On<DateChangeDetail>;
      };
      'af-person-picker': Kit & {
        people?: Person[] | null;
        value?: string | string[] | null;
        multiple?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        loading?: boolean | null;
        disabled?: boolean | null;
        onchange?: On<PersonChangeDetail>;
        onsearch?: On<PersonSearchDetail>;
      };
      'af-rich-editor': Kit<AfRichEditorElement> & {
        value?: string | null;
        readonly?: boolean | null;
        placeholder?: string | null;
        label?: string | null;
        onchange?: On<RichEditorChangeDetail>;
      };
    }
  }
}
