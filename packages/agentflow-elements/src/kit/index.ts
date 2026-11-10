import BulkBar from './BulkBar.svelte';
import Combobox from './Combobox.svelte';
import Confirm from './Confirm.svelte';
import CopyButton from './CopyButton.svelte';
import FileUpload from './FileUpload.svelte';
import FolderSource from './FolderSource.svelte';
import DateField from './DateField.svelte';
import Dialog from './Dialog.svelte';
import Markdown from './Markdown.svelte';
import Menu from './Menu.svelte';
import NumberInput from './NumberInput.svelte';
import Pager from './Pager.svelte';
import PersonPicker from './PersonPicker.svelte';
import Popover from './Popover.svelte';
import RichEditor from './RichEditor.svelte';
import ScrollArea from './ScrollArea.svelte';
import Select from './Select.svelte';
import SignaturePad from './SignaturePad.svelte';
import Splitter from './Splitter.svelte';
import Tabs from './Tabs.svelte';
import Tile from './Tile.svelte';
import Toast from './Toast.svelte';
import Tooltip from './Tooltip.svelte';
import TreePicker from './TreePicker.svelte';
import { AfField } from './form/field.js';
import { AfFieldset } from './form/fieldset.js';
import { AfForm } from './form/form.js';
import { isOlder } from '../version.js';
import { KIT_VERSION } from './version.js';

// A Svelte component compiled as a custom element carries its class as `element`; a plain class is written the same way.
type Compiled = { element: CustomElementConstructor };

const TAGS: Record<string, Compiled> = {
  'af-dialog': Dialog as unknown as Compiled,
  'af-confirm': Confirm as unknown as Compiled,
  'af-menu': Menu as unknown as Compiled,
  'af-popover': Popover as unknown as Compiled,
  'af-tooltip': Tooltip as unknown as Compiled,
  'af-toast': Toast as unknown as Compiled,
  'af-date': DateField as unknown as Compiled,
  'af-person-picker': PersonPicker as unknown as Compiled,
  'af-number-input': NumberInput as unknown as Compiled,
  'af-select': Select as unknown as Compiled,
  'af-combobox': Combobox as unknown as Compiled,
  'af-rich-editor': RichEditor as unknown as Compiled,
  'af-tile': Tile as unknown as Compiled,
  'af-field': { element: AfField },
  'af-fieldset': { element: AfFieldset },
  'af-form': { element: AfForm },
  'af-scroll-area': ScrollArea as unknown as Compiled,
  'af-tabs': Tabs as unknown as Compiled,
  'af-splitter': Splitter as unknown as Compiled,
  'af-pager': Pager as unknown as Compiled,
  'af-copy-button': CopyButton as unknown as Compiled,
  'af-markdown': Markdown as unknown as Compiled,
  'af-tree-picker': TreePicker as unknown as Compiled,
  'af-bulk-bar': BulkBar as unknown as Compiled,
  'af-file-upload': FileUpload as unknown as Compiled,
  'af-signature-pad': SignaturePad as unknown as Compiled,
  'af-folder-source': FolderSource as unknown as Compiled,
};

export const KIT_TAGS: readonly string[] = Object.keys(TAGS);
export { KIT_VERSION };

for (const component of Object.values(TAGS)) Object.defineProperty(component.element, 'kitVersion', { value: KIT_VERSION });

/**
 * Defines each kit tag that is not defined yet. A tag another copy of the kit registered first stays, so a page can hold an
 * older copy than this one: that is reported once per tag, and a module feature-detects anything newer than what it requires.
 */
export function defineKitElements(registry: CustomElementRegistry = customElements): void {
  for (const [tag, component] of Object.entries(TAGS)) {
    const existing = registry.get(tag);
    if (!existing) registry.define(tag, component.element);
    else if (existing !== component.element) {
      const theirs = (existing as { kitVersion?: unknown }).kitVersion;
      if (isOlder(theirs, KIT_VERSION)) {
        console.warn(`An older copy of the AgentFlow UI kit registered ${tag} first; this page uses it, not this copy.`, { tag, registered: theirs ?? null, loaded: KIT_VERSION });
      }
    }
  }
}

defineKitElements();

export { KIT_CSS } from './css.js';
export { loadFonts } from './fonts.js';
export { claimEscape } from './escape.js';
export type { KitFontFace } from './fonts.js';
export type { KitStrings } from './text.js';
export type { AfSubmitDetail, FormError } from './form/form.js';
export type { KitLocale } from './text.js';
export type { AfDrillDetail, AfListColumn, AfListRow, AfOpenRecordDetail, AfPageDetail, AfTilePaging, AfTileResult, AfTileSpec } from './tile/types.js';

export interface MenuItem { id: string; label: string; disabled?: boolean; reason?: string; danger?: boolean; tone?: 'success' | 'warning' | 'info' | 'danger'; type?: 'checkbox' | 'radio'; checked?: boolean }
export interface MenuGroup { id: string; heading?: string; items: MenuItem[] }
/** An entry of `af-menu`'s `items`: a group is an entry with `items`. */
export type MenuEntry = MenuItem | MenuGroup;
export interface TabItem { value: string; label: string; disabled?: boolean; reason?: string }
/** A row of `af-file-upload`: a file the page is uploading, has stored, or failed to upload. */
export interface FileItem {
  id: string;
  name: string;
  size?: number | null;
  status: 'uploading' | 'done' | 'failed';
  /** 0 to 100, while uploading. */
  progress?: number | null;
  error?: string | null;
  /** The name opens it in a new tab. */
  href?: string | null;
  /** An image drawn as the row's thumbnail. */
  preview?: string | null;
}
export interface ToastInput { kind: 'success' | 'error' | 'info'; text: string; action?: { id: string; label: string } }
export type { MentionMenu, MentionMenuGroup, MentionMenuItem, MentionMenuSource, ResolvedMention } from '@reflexify/agentflow-sdk';
export type { FileSetEnvelope, FolderPreview, FolderSources, SlotFolder } from '@reflexify/agentflow-sdk';
export type { ComboboxOption, Person, PickerPage, PickerQuery, PickerSource, SelectOption, TreeNode } from '@reflexify/agentflow-sdk';
