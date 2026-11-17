import { type KitStrings } from './text.js';
type Text = Required<KitStrings>;
/** Whether the kit has a phrase of its own for the type: the page may draw the generic line differently. */
export declare function hasActivityLabel(eventType: string): boolean;
/**
 * The words for one line, in `text`'s language. Three types take a name out of the payload and read without one when it is
 * not there, as it is not on a run's line.
 */
export declare function activityLabel(eventType: string, text: Text, payload?: unknown): string;
interface Actor {
    kind?: string | null;
    display_name?: string | null;
}
/** The name drawn for an actor; one with none is the kind it is, and anyone else is someone. */
export declare function actorName(actor: Actor | null | undefined, text: Text): string;
/** The timeline's `data-kind` for an actor's kind; none for a kind it has no colour for. */
export declare function actorTone(kind: string | null | undefined): string | null;
/**
 * The lines under a line of the feed: the fields an update changed and what happened to a list's items, or a stage move's
 * `from → to`. A key with no label in `fields` is drawn as it is.
 */
export declare function changeLines(eventType: string, payload: unknown, fields: Record<string, string> | null | undefined, text: Text): string[];
export {};
//# sourceMappingURL=activity-labels.d.ts.map