# Review checklist

Copied word for word from `node_modules/@reflexify/agentflow-elements/DESIGN.md`, "Review checklist". When the two differ, the guide is right.

Answer each question in English and in Vietnamese, in the light and the dark theme, at 1280 px and at 800 px of module width, and once with a red primary colour, as AgentFlow's crimson brand gives. Every answer must be yes.

1. Is every colour a token from the root's block, a `color-mix` of tokens, or a module-owned hue declared there, with no other hex, `rgb()` or `oklch()` literal?
2. Does coloured text use an `-ink` mix, with the raw status hues only on icons and bars?
3. Do status and priority avoid `--accent`, so the screen still reads when the primary colour is red?
4. Are spacing, radius, type and duration all from the scales in Foundations?
5. Does the module put one `<style>` in its shadow root, the kit's CSS first, with no selector on `:root`, `html` or `body` and no custom property on `:host`?
6. Are responsive rules `@container` queries only, with no width `@media`, no viewport unit and no window size?
7. Does the module's own code add no listener on `document` or `window`?
8. Does every id come from a key resolved through the SDK's objects cache, and every API address the browser opens itself (a download, an image) from `host.apiUrl`?
9. Does a change of language or theme re-render in place, keeping an open dialog and what is typed in it?
10. Does every interactive element have hover, focus-visible, active and locked states?
11. Is every focus ring of the module's own controls 2 px, solid, in the primary colour, unclipped, and drawn on the card rather than on a stretched `::after`, and does a kit class or element keep the ring the kit gives it?
12. Is every control at least 32 px, or 24 px with 4 px between them in a dense row?
13. Is every locked control `aria-disabled`, with its reason in a tooltip and in hidden text that its `aria-describedby` names?
14. Does truncated text carry its full text in one `af-tooltip`, while status words, buttons and reasons wrap instead?
15. Does Vietnamese fit, with no clipped diacritics (line height at least 1.35) and no fixed-width box around text?
16. Are the icons SVG in `currentColor` at 16, 14 or 12 px with `aria-hidden`, and is there no emoji?
17. Are dates formatted through `Intl` as `af-date` formats them, relative only for the day before, of or after today, each a `<time dateTime>` with its full date in a tooltip?
18. Do numbers go through `Intl.NumberFormat`, with `tabular-nums`?
19. Does every change made in place show its result before the server answers, and roll back with the flash and the server's reason?
20. Does a confirmation come only before what cannot be undone, with the act's name on its button and a dismiss word that is not the act's verb?
21. Does loading show a skeleton shaped like the layout after 150 ms, and do empty states give an icon, a title and at most one action, and errors the reason and Try again?
22. Is all motion `transform` and `opacity`, with reduced motion respected, and does dark mode keep visible surface steps, borders beside shadows and legible tints?
23. Is every `af-tooltip` on a non-interactive value mounted on first pointer arrival, and does it only add detail the visible text implies, with the full form also visually hidden text?
24. Does every form control sit in an `af-field` with its label, help and error, or, standing alone (a filter in a toolbar), carry a `label` of its own?
25. Is the `source` of every `af-combobox`, `af-person-picker` and `af-tree-picker` one stable function, a module constant or one memoised for the page's lifetime, and never built inline in a render, `directory.people(client)` and the other directory sources included?
26. Does a form post through `af-form`'s `af-submit`, with `busy` set in the handler and cleared when the save ends, so that a double press saves once?
27. Do the API's field errors go to `af-form`'s `errors`, so that each lands on its field and the rest in the summary?
28. Does everything of the module's own that scrolls sit in an `af-scroll-area`, with no `overflow: auto` or `overflow: scroll` in the module's CSS?
29. Is every table native markup carrying the kit's `af-table` class, with a caption and `scope="col"` on each header?
30. Does every value that is Markdown render through `af-markdown`, and never by setting `innerHTML`?
31. If a selection has a shortcut, does the module bind it, on its shadow root, to the `af-bulk-bar`'s `focus()`, since the bar binds no key?
32. Does a module that uploads files keep the `items` of its `af-file-upload` itself, adding a row when `files-add` arrives and setting it `done` or `failed` when the upload ends, since the element keeps none?
33. Does a start-form field that takes a folder go through `af-folder-source`, with `sources` made once, the set id from `af-folder-upload-started` kept for `resume-set`, and the launch locked while the last `af-folder-change` has no `value` or its `preview` carries a `refusal`?

## A task page also answers

These are not in `DESIGN.md`'s checklist; answer them for a module that calls `host.tasks` (`task-pages.md`), in the same conditions.

- The task id comes from the path, and `<agentflow-task record>` gets it: not the subject's id.
- The page checks `host.tasks` and `'tasks' in provider`, and shows a notice with a link to AgentFlow when either is missing.
- Every `reason` an action can carry has a sentence in both languages, and a locked action shows its reason.
- Every rejected call shows `error.problem.title`; no refusal is swallowed.
- Claim is offered when `work.canClaim`, and Save only when `canSaveDraft`.
- `not_found`, `finished`, `error` and `loading` each have a screen, and anything the page does not draw links to the task in AgentFlow.
- No call to a task's `…/step/*` route outside the handle, and no link to `/inbox?record=…` for the app's own tasks.

## A module that starts a run from a folder also answers

These are not in `DESIGN.md`'s checklist; answer them for a module that uses `af-folder-source` or `folderSources`
(`records-api.md`, "Records from a folder"), in the same conditions.

- The folder goes into an upload set, never into a start form's file field: the module makes no call to `POST /attachments` for it.
- `sources` is made once with `folderSources(client)`, not in a render, and `folder` comes from the workflow's input contract.
- The Start button is locked while `af-folder-change`'s `value` is `null` and while its `preview.refusal` is set, and it sends `value` as it is.
- The id from `af-folder-upload-started` is kept (`sessionStorage` for a reload; `localStorage`, keyed by person, when a closed tab must resume too) and given back as `resume-set`; it is cleared once the run starts.
- A set the person abandons is deleted (`sources.deleteSet`) while its id is still held, because each person may hold only five unfinished sets and one left behind holds a place for at least an hour.
- A second start with the same set is expected to fail (`UPLOAD_SET_ALREADY_LAUNCHED`): the screen starts one run per set and makes a new set for another import.
- A refusal the element shows is in its own words and the page's language (the server's sentence and `code` are in `af-folder-error`, for what the module adds), and a refusal of the module's own call shows `error.problem.title`: none is swallowed.
