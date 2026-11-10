/** What a picker asks its source for: the text typed so far, where the last page ended, and a signal that fires when the answer is no longer wanted. */
export interface PickerQuery {
  q: string;
  cursor: string | null;
  signal: AbortSignal;
}

/** One page of a source's answer; `next` is the cursor for the page after it, or null at the end. */
export interface PickerPage<T> {
  items: T[];
  next: string | null;
}

/** Where a picker gets its options. `resolve` names the options for ids the picker holds but has not listed. */
export interface PickerSource<T> {
  (query: PickerQuery): Promise<PickerPage<T>>;
  resolve?(ids: string[], signal: AbortSignal): Promise<T[]>;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  reason?: string;
}

export interface ComboboxOption extends SelectOption {
  description?: string | null;
}

export interface Person {
  id: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
}

/** One node of a picker's tree. A node whose parent is not in the set is a root. */
export interface TreeNode {
  id: string;
  parentId: string | null;
  label: string;
  code?: string | null;
  archived?: boolean;
  disabled?: boolean;
  reason?: string;
}
