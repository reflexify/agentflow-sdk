export type KitLocale = 'vi' | 'en';

export interface KitStrings {
  close: string;
  cancel: string;
  confirm: string;
  today: string;
  clear: string;
  remove?: string;
  unknownPerson?: string;
  noResults: string;
  bold: string;
  italic: string;
  bulletList: string;
  numberedList: string;
  link: string;
  mentionMenu?: string;
  mentionRestricted?: string;
  mentionRestrictedPerson?: string;
  mentionDeleted?: string;
  previousMonth: string;
  nextMonth: string;
  notifications: string;
  openCalendar: string;
  closeCalendar: string;
  calendar: string;
  chooseDate: string;
  selectedDate: string;
  previousYear: string;
  nextYear: string;
  previousDecade: string;
  nextDecade: string;
  switchView: string;
  currentView: string;
  viewDay: string;
  viewMonth: string;
  viewYear: string;
  valueMissing?: string;
  rangeUnderflow?: string;
  rangeOverflow?: string;
  badDate?: string;
  badNumber?: string;
  increase?: string;
  decrease?: string;
  numberUnderflow?: string;
  numberOverflow?: string;
  noOptions?: string;
  loading?: string;
  loadMore?: string;
  unknownOption?: string;
  rangeStart?: string;
  rangeEnd?: string;
  locked?: string;
  formErrors?: string;
  resizeHandle?: string;
  previous?: string;
  next?: string;
  rowsPerPage?: string;
  pageRange?: string;
  pageRangeOpen?: string;
  shownOf?: string;
  shownOnly?: string;
  moreLoaded?: string;
  copy?: string;
  copied?: string;
  copyFailed?: string;
  archived?: string;
  maxPicked?: string;
  noNodes?: string;
  noMatches?: string;
  selectedCount?: string;
  selectedOfTotal?: string;
  clearSelection?: string;
  moreActions?: string;
  dropFiles?: string;
  dropFile?: string;
  browse?: string;
  multipleAllowed?: string;
  oneFileOnly?: string;
  noFiles?: string;
  uploading?: string;
  uploadFailed?: string;
  removeFile?: string;
  fileTypeRefused?: string;
  fileCountRefused?: string;
  fileDuplicate?: string;
  signaturePad?: string;
  signHint?: string;
  folderSource?: string;
  folderFromFiles?: string;
  folderFromComputer?: string;
  folderFromWatched?: string;
  folderDrop?: string;
  folderBrowse?: string;
  folderGrainFolder?: string;
  folderGrainDeep?: string;
  folderGrainFile?: string;
  folderResumeHint?: string;
  folderNeedsFolder?: string;
  folderNeedsFiles?: string;
  folderUploadStarting?: string;
  folderUploadProgress?: string;
  folderUploadFailed?: string;
  folderRetry?: string;
  folderUploadDone?: string;
  folderEmpty?: string;
  folderNoSources?: string;
  folderRefused?: string;
  folderWatchedRoot?: string;
  folderWatchedEmpty?: string;
  folderNoSubfolders?: string;
  folderLoadFailed?: string;
  folderOpen?: string;
  folderFileCountOne?: string;
  folderFileCount?: string;
  folderFilesReady?: string;
  folderChecking?: string;
  folderPreviewFailed?: string;
  folderPreview?: string;
  folderGroups?: string;
  folderItems?: string;
  folderLeftOut?: string;
  folderSample?: string;
  folderRefusal?: string;
  folderRefusedFilesOne?: string;
  folderRefusedFiles?: string;
  folderReasonNotInAFolder?: string;
  folderReasonNotSettled?: string;
  folderReasonNoMarker?: string;
  folderReasonTooManyFiles?: string;
  folderReasonBelowMinItems?: string;
  folderReasonAboveMaxItems?: string;
  folderReasonFileTooLarge?: string;
  folderReasonUploadSetIncomplete?: string;
  folderReasonNoReadyGroups?: string;
  folderReasonAlreadyLaunched?: string;
  folderReasonOtherConsumers?: string;
  folderReasonMarkerNeedsFolders?: string;
  folderReasonInUse?: string;
  folderReasonOther?: string;
  tileLoading?: string;
  tileLoadFailed?: string;
  tileUnavailable?: string;
  tileUnavailableHint?: string;
  tileFailed?: string;
  tileNotDrawn?: string;
  tileNoValue?: string;
  tileNoBuckets?: string;
  tileNoData?: string;
  tileRecordsOne?: string;
  tileRecords?: string;
  tileCapAtLeast?: string;
  tileCapAtMost?: string;
  tileCapSample?: string;
  tileCapIncomplete?: string;
  tileChartCapAtLeast?: string;
  tileChartCapAtMost?: string;
  tileGoal?: string;
  tileGoalShort?: string;
  tileGoalOver?: string;
  tileGoalMet?: string;
  tilePoints?: string;
  tileVsEarlier?: string;
  tileEarlier?: string;
  tileNoEarlier?: string;
  tileNew?: string;
  tileGone?: string;
  tileUnmatched?: string;
  tileDifference?: string;
  tileTarget?: string;
  tileBarTotal?: string;
  tileFilled?: string;
  tileSkipped?: string;
  tileUnweightedAverage?: string;
  tileUnfiltered?: string;
  tileDeclined?: string;
  tileEmptied?: string;
  tileTargetsWithheld?: string;
  tilePartial?: string;
  tileBucketEmpty?: string;
  tileBucketRestricted?: string;
  tileBucketOther?: string;
  tileYes?: string;
  tileNo?: string;
  tileListEmpty?: string;
  tileListNoColumns?: string;
  tilePrevious?: string;
  tileNext?: string;
  tileOpenRecord?: string;
  tileFileUnavailable?: string;
  tileItemsOne?: string;
  tileItems?: string;
  tileOpenRecordsOne?: string;
  tileOpenRecords?: string;
  tileDrillOff?: string;
  tileShowTable?: string;
  tileShowChart?: string;
  tileIsolate?: string;
  tileShowAll?: string;
  tileShare?: string;
  tileUnitCount?: string;
  tileUnitRatio?: string;
  tileUnitPercent?: string;
  tileUnitNumber?: string;
  tileUnitDuration?: string;
  tileUnitMinutes?: string;
  tileUnitHours?: string;
  tileUnitDays?: string;
  tileUnitRating?: string;
  tileUnitDate?: string;
  tileRunningTotal?: string;
  tileDerivedRunning?: string;
  tileRank?: string;
  tileFormula?: string;
  tileFormulaNoValue?: string;
  tileDerivedShare?: string;
  tileDerivedShareRemainder?: string;
  tileDerivedRank?: string;
  tileRankHighest?: string;
  tileRankLowest?: string;
  tileTiesDense?: string;
  tileTiesCompetition?: string;
  tileVerdictPartitions?: string;
  tileVerdictPartitionsNoTotal?: string;
  tileVerdictPartitionsStacked?: string;
  tileVerdictPartitionsStackedNoTotal?: string;
  tileVerdictFansOut?: string;
  tileVerdictOverlaps?: string;
  tileVerdictNotApplicable?: string;
  activity?: string;
  activityEmpty?: string;
  activityViaAssistant?: string;
  activityActorSomeone?: string;
  activityActorSystem?: string;
  activityActorAgent?: string;
  activityChanged?: string;
  activityListAdded?: string;
  activityListRemoved?: string;
  activityListMoved?: string;
  activityListChanged?: string;
  activityListMore?: string;
  activityListYes?: string;
  activityListNo?: string;
  activityListUntitled?: string;
  activityInstanceStarted?: string;
  activityInstanceCompleted?: string;
  activityInstanceFailed?: string;
  activityInstanceCancelled?: string;
  activityInstancePaused?: string;
  activityInstanceResumed?: string;
  activityInstanceRetried?: string;
  activityInstanceArchived?: string;
  activityInstanceUnarchived?: string;
  activityTaskCreated?: string;
  activityTaskOpened?: string;
  activityTaskClaimed?: string;
  activityTaskReassigned?: string;
  activityTaskReassignFallback?: string;
  activityTaskActionTaken?: string;
  activityTaskActionTakenUnknown?: string;
  activityTaskSubmitted?: string;
  activityTaskRejected?: string;
  activityTaskCancelled?: string;
  activityTaskEscalated?: string;
  activityTaskSigned?: string;
  activityTaskSigningCancelled?: string;
  activityTaskSigningFailed?: string;
  activityNodeRunStarted?: string;
  activityNodeRunCompleted?: string;
  activityNodeRunFailed?: string;
  activityNodeRunWaiting?: string;
  activityAgentStarted?: string;
  activityAgentSucceeded?: string;
  activityAgentFailed?: string;
  activityAgentMcpCall?: string;
  activityRecordCreated?: string;
  activityRecordUpdated?: string;
  activityRecordStageTransitioned?: string;
  activityRecordSeriesRaised?: string;
  activityRecordSeriesRaisedUnnamed?: string;
  activityWorkStarted?: string;
  activityWorkAssigned?: string;
  activityWorkClaimed?: string;
  activityWorkReleased?: string;
  activityWorkReassigned?: string;
  activityWorkCompleted?: string;
  activityWorkUnassignable?: string;
  activityWorkTooManyPeople?: string;
  activityWorkClockStarted?: string;
  activityWorkClockPaused?: string;
  activityWorkClockResumed?: string;
  activityWorkClockBreached?: string;
  activityWorkClockStopped?: string;
  activityWorkClockCancelled?: string;
  activityWorkClockEscalated?: string;
  activityWorkRecipientSkipped?: string;
  activityWorkAudienceSuppressed?: string;
  activityWorkCancelled?: string;
  activityWorkWithdrawn?: string;
  activityWorkUnassigned?: string;
  activityWorkOther?: string;
  comments?: string;
  commentsEmpty?: string;
  commentEarlier?: string;
  commentPlaceholder?: string;
  commentComposerLabel?: string;
  commentEditLabel?: string;
  commentHintSend?: string;
  commentHintMention?: string;
  commentSend?: string;
  commentSave?: string;
  commentEdited?: string;
  commentEditedAt?: string;
  commentEditBy?: string;
  commentDeleteBy?: string;
  commentDeleteTitle?: string;
  commentDeleteBody?: string;
  commentDeleteConfirm?: string;
  commentClosed?: string;
  commentClosedHint?: string;
  commentUnnotified?: string;
  commentOpenFile?: string;
  commentAttach?: string;
  runStream?: string;
  runStreamWaiting?: string;
  runStreamRunning?: string;
  runStreamDone?: string;
  runStreamStopped?: string;
  runStreamTool?: string;
  runStreamStepDone?: string;
  runStreamStepStopped?: string;
  runStreamCompleted?: string;
  runStreamFailed?: string;
  runStreamCancelled?: string;
  runStreamItem?: string;
  runStreamItems?: string;
  runStreamItemsState?: string;
  runStreamUnavailable?: string;
}

export const KIT_TEXT: Record<KitLocale, Required<KitStrings>> = {
  en: {
    close: 'Close', cancel: 'Cancel', confirm: 'Confirm', today: 'Today', clear: 'Clear', remove: 'Remove', unknownPerson: 'Unknown person', noResults: 'No matches',
    bold: 'Bold', italic: 'Italic', bulletList: 'Bulleted list', numberedList: 'Numbered list', link: 'Link',
    mentionMenu: 'Mention suggestions', mentionRestricted: 'Restricted record', mentionRestrictedPerson: 'Restricted person', mentionDeleted: 'Deleted record',
    previousMonth: 'Previous month', nextMonth: 'Next month', notifications: 'Notifications',
    openCalendar: 'Open calendar', closeCalendar: 'Close calendar', calendar: 'Calendar', chooseDate: 'Choose {date}', selectedDate: 'Selected date. {date}',
    previousYear: 'Previous year', nextYear: 'Next year', previousDecade: 'Previous decade', nextDecade: 'Next decade',
    switchView: 'Switch to {view} view', currentView: '{view} view', viewDay: 'day', viewMonth: 'month', viewYear: 'year',
    valueMissing: 'Fill in this field.', rangeUnderflow: 'Must be {min} or later.', rangeOverflow: 'Must be {max} or earlier.', badDate: 'Enter a date as {format}.', badNumber: 'Enter a number as {example}.',
    increase: 'Increase', decrease: 'Decrease', numberUnderflow: 'Must be {min} or more.', numberOverflow: 'Must be {max} or less.', noOptions: 'No options',
    loading: 'Loading…', loadMore: 'Load more', unknownOption: 'Unknown value', rangeStart: 'Start date', rangeEnd: 'End date', locked: 'Locked', formErrors: 'Some fields need attention', resizeHandle: 'Resize panes',
    previous: 'Previous', next: 'Next', rowsPerPage: 'Rows per page', pageRange: '{start}–{end} of {total}', pageRangeOpen: '{start}–{end}',
    shownOf: 'Showing {shown} of {total}', shownOnly: 'Showing {shown}', moreLoaded: '{count} more loaded',
    copy: 'Copy', copied: 'Copied', copyFailed: "Couldn't copy",
    archived: 'Archived', maxPicked: 'At most {max}', noNodes: 'Nothing to choose from', noMatches: 'No matches',
    selectedCount: '{count} selected', selectedOfTotal: '{count} of {total} selected', clearSelection: 'Clear selection', moreActions: 'More actions',
    dropFiles: 'Drop files here, or', dropFile: 'Drop a file here, or', browse: 'browse', multipleAllowed: 'Multiple files allowed.', oneFileOnly: 'One file only.',
    noFiles: 'No files attached.', uploading: 'Uploading…', uploadFailed: 'Failed', removeFile: 'Remove file',
    fileTypeRefused: '{name} is not an allowed type.', fileCountRefused: 'At most {max} files.', fileDuplicate: '{name} appears more than once; it was added once.',
    signaturePad: 'Signature', signHint: 'Use your mouse or finger to sign. Click Clear to start over.',
    folderSource: 'Source', folderFromFiles: 'Files', folderFromComputer: 'Folder from this computer', folderFromWatched: 'Watched folder', folderDrop: 'Drop a folder here, or',
    folderBrowse: 'choose a folder', folderGrainFolder: 'Each folder directly inside it is one item.', folderGrainDeep: 'Each folder {depth} levels inside it is one item.',
    folderGrainFile: 'Each file is one item.', folderResumeHint: 'Choose the same folder to continue the upload that was interrupted.',
    folderNeedsFolder: 'Drop a folder here, not single files.', folderNeedsFiles: 'Drop files here, not a folder.', folderUploadStarting: 'Preparing the upload…',
    folderUploadProgress: '{stored} of {total} files uploaded', folderUploadFailed: 'The upload stopped. Try again to continue where it left off.', folderRetry: 'Try again', folderUploadDone: 'The upload is complete.',
    folderEmpty: 'That folder holds no files, so there is nothing to upload.', folderNoSources: 'Files cannot be chosen here: nothing is connected to read them from.',
    folderRefused: 'This was refused, and trying again will not change that.',
    folderWatchedRoot: 'Watched folders', folderWatchedEmpty: 'There are no watched folders you can use.', folderNoSubfolders: 'No folders inside.',
    folderLoadFailed: 'The folders could not be loaded.', folderOpen: 'Open {name}', folderFileCountOne: '{count} file', folderFileCount: '{count} files',
    folderFilesReady: '{ready} of {count} files ready', folderChecking: 'Checking what a launch would take…', folderPreviewFailed: 'What a launch would take could not be checked.',
    folderPreview: 'What a launch would take', folderGroups: 'Folders', folderItems: 'Files', folderLeftOut: 'Left out', folderSample: 'Starting with',
    folderRefusal: 'A launch would be refused', folderRefusedFilesOne: '{count} file was too large to upload and is left out.',
    folderRefusedFiles: '{count} files were too large to upload and are left out.', folderReasonNotInAFolder: 'Files that are in no folder',
    folderReasonNotSettled: 'Still being copied in, so not ready', folderReasonNoMarker: 'Not marked as complete yet', folderReasonTooManyFiles: 'Too many files in one folder',
    folderReasonBelowMinItems: 'Fewer files than this field takes', folderReasonAboveMaxItems: 'More files than this field takes',
    folderReasonFileTooLarge: 'Holds a file too large to store', folderReasonUploadSetIncomplete: 'The upload has not finished', folderReasonNoReadyGroups: 'Nothing in it is ready to run yet',
    folderReasonAlreadyLaunched: 'A run was already started from this upload; upload the files again to start another',
    folderReasonOtherConsumers: 'This workflow reads the field in a way a folder cannot be used for',
    folderReasonMarkerNeedsFolders: 'This folder waits for a completion marker, and this workflow runs one file at a time',
    folderReasonInUse: 'A run that has not finished is still reading it', folderReasonOther: 'Another reason ({code})',
    tileLoading: 'Loading…', tileLoadFailed: 'This tile could not be loaded. Reload the page to try again.', tileUnavailable: 'Not available to you', tileUnavailableHint: 'This tile is over records you cannot list.',
    tileFailed: 'This tile cannot be computed', tileNotDrawn: 'This tile cannot be drawn here yet',
    tileNoValue: 'No value over this population', tileNoBuckets: 'No buckets over these records', tileNoData: 'No data',
    tileRecordsOne: '{count} record', tileRecords: '{count} records',
    tileCapAtLeast: 'at least', tileCapAtMost: 'at most', tileCapSample: 'a sample of the first {cap} records', tileCapIncomplete: 'incomplete — no bound',
    tileChartCapAtLeast: 'Counted up to {cap} records: each figure is at least what is shown',
    tileChartCapAtMost: 'Counted up to {cap} records: each figure is at most what is shown',
    tileGoal: 'goal {target}', tileGoalShort: '{distance} short', tileGoalOver: '{distance} over', tileGoalMet: 'on goal', tilePoints: '{value} pts',
    tileVsEarlier: 'vs earlier period', tileEarlier: 'earlier period', tileNoEarlier: 'no earlier figure',
    tileNew: 'new', tileGone: 'gone', tileUnmatched: 'no matching day',
    tileDifference: 'difference', tileTarget: 'target', tileBarTotal: 'bar total', tileFilled: 'no records (filled)',
    tileSkipped: '{count} skipped: missing a date', tileUnweightedAverage: 'Unweighted average of per-record rates',
    tileUnfiltered: "Not filtered by the page's filter: these records have no such field.",
    tileDeclined: "Shows everything: this tile does not follow the page's filter.",
    tileEmptied: "No records match this tile's filter together with the page's.",
    tileTargetsWithheld: "Targets come from a table you can't open", tilePartial: 'Some records are withheld from you and not shown',
    tileBucketEmpty: '(Empty)', tileBucketRestricted: '(Restricted)', tileBucketOther: '(Other)', tileYes: 'Yes', tileNo: 'No',
    tileListEmpty: 'No records match this view.', tileListNoColumns: "None of this view's columns can be shown to you.", tilePrevious: 'Previous', tileNext: 'Next', tileOpenRecord: 'Open {label}', tileFileUnavailable: 'File unavailable',
    tileItemsOne: '{count} item', tileItems: '{count} items',
    tileOpenRecordsOne: 'Click to open {count} record', tileOpenRecords: 'Click to open {count} records', tileDrillOff: 'Records link is off for this tile',
    tileShowTable: 'Show as table', tileShowChart: 'Show as chart', tileIsolate: 'Show only {series}', tileShowAll: 'Show every series', tileShare: 'share',
    tileUnitCount: 'count', tileUnitRatio: 'ratio', tileUnitPercent: '%', tileUnitNumber: 'number', tileUnitDuration: 'duration',
    tileUnitMinutes: 'minutes', tileUnitHours: 'hours', tileUnitDays: 'days', tileUnitRating: 'rating', tileUnitDate: 'date',
    tileRunningTotal: 'running total', tileDerivedRunning: 'Running total', tileRank: 'Rank', tileFormula: 'Formula', tileFormulaNoValue: 'no value',
    tileDerivedShare: 'Share of the buckets shown', tileDerivedShareRemainder: 'shares of the buckets shown, remainder included',
    tileDerivedRank: 'Rank, {direction} first, {ties}', tileRankHighest: 'highest', tileRankLowest: 'lowest',
    tileTiesDense: 'dense ties', tileTiesCompetition: 'competition ties',
    tileVerdictPartitions: 'Bars add up to {total}', tileVerdictPartitionsNoTotal: 'Bars add up to the total',
    tileVerdictPartitionsStacked: 'Segments add up to each bar; bars add up to {total}',
    tileVerdictPartitionsStackedNoTotal: 'Segments add up to each bar; bars add up to the total',
    tileVerdictFansOut: 'Bars sum to {bucketSum}; the population total is {total}. {gap} is counted more than once.',
    tileVerdictOverlaps: 'Buckets overlap and cannot be combined', tileVerdictNotApplicable: 'No total to reconcile against',
    activity: 'Activity', activityEmpty: 'No activity yet.', activityViaAssistant: 'via assistant', activityActorSomeone: 'Someone', activityActorSystem: 'System', activityActorAgent: 'Agent',
    activityChanged: 'Changed: {fields}', activityListAdded: '{field}: added “{item}”', activityListRemoved: '{field}: removed “{item}”', activityListMoved: '{field}: moved “{item}”', activityListChanged: '{field}: “{item}” {column} {from} → {to}', activityListMore: '+{count} more', activityListYes: 'yes', activityListNo: 'no', activityListUntitled: 'an item',
    activityInstanceStarted: 'started the instance', activityInstanceCompleted: 'completed the instance', activityInstanceFailed: 'marked the instance failed',
    activityInstanceCancelled: 'cancelled the instance', activityInstancePaused: 'paused the instance', activityInstanceResumed: 'resumed the instance',
    activityInstanceRetried: 'retried the instance', activityInstanceArchived: 'archived the instance',
    activityInstanceUnarchived: 'restored the instance from the archive',
    activityTaskCreated: 'created the task', activityTaskOpened: 'opened the task', activityTaskClaimed: 'claimed the task',
    activityTaskReassigned: 'reassigned the task to {name}', activityTaskReassignFallback: 'someone else', activityTaskActionTaken: 'chose “{action}”',
    activityTaskActionTakenUnknown: 'took an action', activityTaskSubmitted: 'submitted the task', activityTaskRejected: 'rejected the task',
    activityTaskCancelled: 'cancelled the task', activityTaskEscalated: 'escalated the task', activityTaskSigned: 'signed the document',
    activityTaskSigningCancelled: 'cancelled the signing request', activityTaskSigningFailed: 'marked the signing request failed',
    activityNodeRunStarted: 'started the step', activityNodeRunCompleted: 'completed the step', activityNodeRunFailed: 'marked the step failed',
    activityNodeRunWaiting: 'left the step waiting',
    activityAgentStarted: 'started the agent', activityAgentSucceeded: 'completed the agent run', activityAgentFailed: 'marked the agent run failed',
    activityAgentMcpCall: 'called an external tool',
    activityRecordCreated: 'created the record', activityRecordUpdated: 'updated the record', activityRecordStageTransitioned: 'changed the stage',
    activityRecordSeriesRaised: 'created this record from the recurring series {name}', activityRecordSeriesRaisedUnnamed: 'created this record from a recurring series',
    activityWorkStarted: 'started the work', activityWorkAssigned: 'assigned the work', activityWorkClaimed: 'claimed the work',
    activityWorkReleased: 'released the work', activityWorkReassigned: 'handed the work on', activityWorkCompleted: 'finished the work',
    activityWorkUnassignable: 'found no one to assign the work to', activityWorkTooManyPeople: 'found too many people to assign the work to',
    activityWorkClockStarted: 'started the deadline clock', activityWorkClockPaused: 'paused the deadline clock', activityWorkClockResumed: 'resumed the deadline clock',
    activityWorkClockBreached: 'let the work pass its deadline', activityWorkClockStopped: 'stopped the deadline clock',
    activityWorkClockCancelled: 'cancelled the deadline clock', activityWorkClockEscalated: 'escalated the overdue work',
    activityWorkRecipientSkipped: 'skipped a notice’s recipient', activityWorkAudienceSuppressed: 'held back a notice nobody could open',
    activityWorkCancelled: 'cancelled the work', activityWorkWithdrawn: 'withdrew the work', activityWorkUnassigned: 'took the work off its assignee',
    activityWorkOther: 'updated the work',
    comments: 'Comments', commentsEmpty: 'No comments yet.', commentEarlier: 'Show older comments', commentPlaceholder: 'Write a comment', commentComposerLabel: 'Write a comment', commentEditLabel: 'Edit comment',
    commentHintSend: 'Ctrl/⌘+Enter to send', commentHintMention: 'Type @ to mention someone', commentSend: 'Send', commentSave: 'Save', commentEdited: 'edited', commentEditedAt: 'Edited {when}',
    commentEditBy: 'Edit comment by {name}', commentDeleteBy: 'Delete comment by {name}', commentDeleteTitle: 'Delete this comment?', commentDeleteBody: 'The comment and its files will be removed for everyone.', commentDeleteConfirm: 'Delete',
    commentClosed: 'Comments are closed', commentClosedHint: 'This record\'s discussion is read-only.', commentUnnotified: '{names} can\'t see this record and weren\'t notified',
    commentOpenFile: 'Open {name}', commentAttach: 'Attach a file',
    runStream: 'Run progress', runStreamWaiting: 'Waiting for the run to start', runStreamRunning: 'Running', runStreamDone: 'Done', runStreamStopped: 'Stopped',
    runStreamTool: 'Using a tool', runStreamStepDone: '{step}: done', runStreamStepStopped: '{step}: stopped', runStreamCompleted: 'The run completed',
    runStreamFailed: 'The run failed', runStreamCancelled: 'The run was cancelled', runStreamItem: 'Item {n}', runStreamItems: '{count} items',
    runStreamItemsState: '{done} done, {running} running, {failed} stopped', runStreamUnavailable: 'Live progress is not available for this run.',
  },
  vi: {
    close: 'Đóng', cancel: 'Huỷ', confirm: 'Xác nhận', today: 'Hôm nay', clear: 'Xoá', remove: 'Bỏ', unknownPerson: 'Người không rõ', noResults: 'Không có kết quả',
    bold: 'Đậm', italic: 'Nghiêng', bulletList: 'Danh sách', numberedList: 'Danh sách số', link: 'Liên kết',
    mentionMenu: 'Gợi ý nhắc đến', mentionRestricted: 'Bản ghi bị hạn chế', mentionRestrictedPerson: 'Người bị hạn chế', mentionDeleted: 'Bản ghi đã xoá',
    previousMonth: 'Tháng trước', nextMonth: 'Tháng sau', notifications: 'Thông báo',
    openCalendar: 'Mở lịch', closeCalendar: 'Đóng lịch', calendar: 'Lịch', chooseDate: 'Chọn {date}', selectedDate: 'Đã chọn {date}',
    previousYear: 'Năm trước', nextYear: 'Năm sau', previousDecade: 'Thập kỷ trước', nextDecade: 'Thập kỷ sau',
    switchView: 'Chuyển sang xem {view}', currentView: 'Xem {view}', viewDay: 'ngày', viewMonth: 'tháng', viewYear: 'năm',
    valueMissing: 'Vui lòng điền trường này.', rangeUnderflow: 'Phải từ {min} trở đi.', rangeOverflow: 'Phải từ {max} trở về trước.', badDate: 'Nhập ngày theo dạng {format}.', badNumber: 'Nhập số theo dạng {example}.',
    increase: 'Tăng', decrease: 'Giảm', numberUnderflow: 'Phải từ {min} trở lên.', numberOverflow: 'Phải từ {max} trở xuống.', noOptions: 'Không có lựa chọn',
    loading: 'Đang tải…', loadMore: 'Tải thêm', unknownOption: 'Giá trị không xác định', rangeStart: 'Ngày bắt đầu', rangeEnd: 'Ngày kết thúc', locked: 'Đã khoá', formErrors: 'Một số trường cần sửa', resizeHandle: 'Thay đổi kích thước khung',
    previous: 'Trước', next: 'Sau', rowsPerPage: 'Số dòng mỗi trang', pageRange: '{start}–{end} trên {total}', pageRangeOpen: '{start}–{end}',
    shownOf: 'Đang hiện {shown} trên {total}', shownOnly: 'Đang hiện {shown}', moreLoaded: 'Đã tải thêm {count}',
    copy: 'Sao chép', copied: 'Đã sao chép', copyFailed: 'Không sao chép được',
    archived: 'Đã lưu trữ', maxPicked: 'Tối đa {max}', noNodes: 'Không có mục nào', noMatches: 'Không có kết quả',
    selectedCount: 'Đã chọn {count}', selectedOfTotal: 'Đã chọn {count} trên {total}', clearSelection: 'Bỏ chọn', moreActions: 'Thêm hành động',
    dropFiles: 'Thả tệp vào đây, hoặc', dropFile: 'Thả một tệp vào đây, hoặc', browse: 'chọn tệp', multipleAllowed: 'Có thể thêm nhiều tệp.', oneFileOnly: 'Chỉ một tệp.',
    noFiles: 'Chưa đính kèm tệp nào.', uploading: 'Đang tải lên…', uploadFailed: 'Thất bại', removeFile: 'Gỡ tệp',
    fileTypeRefused: '{name} không đúng định dạng cho phép.', fileCountRefused: 'Tối đa {max} tệp.', fileDuplicate: '{name} xuất hiện nhiều lần; chỉ thêm một lần.',
    signaturePad: 'Chữ ký', signHint: 'Dùng chuột hoặc ngón tay để ký. Bấm Xoá để ký lại.',
    folderSource: 'Nguồn', folderFromFiles: 'Tệp', folderFromComputer: 'Thư mục từ máy tính này', folderFromWatched: 'Thư mục theo dõi', folderDrop: 'Thả một thư mục vào đây, hoặc',
    folderBrowse: 'chọn thư mục', folderGrainFolder: 'Mỗi thư mục con trực tiếp là một mục.', folderGrainDeep: 'Mỗi thư mục ở cấp thứ {depth} bên trong là một mục.',
    folderGrainFile: 'Mỗi tệp là một mục.', folderResumeHint: 'Chọn lại đúng thư mục đó để tiếp tục lượt tải lên bị gián đoạn.',
    folderNeedsFolder: 'Hãy thả một thư mục, không phải các tệp riêng lẻ.', folderNeedsFiles: 'Hãy thả tệp, không phải thư mục.', folderUploadStarting: 'Đang chuẩn bị tải lên…',
    folderUploadProgress: 'Đã tải lên {stored} trên {total} tệp', folderUploadFailed: 'Việc tải lên đã dừng. Thử lại để tiếp tục từ chỗ dang dở.', folderRetry: 'Thử lại', folderUploadDone: 'Đã tải lên xong.',
    folderEmpty: 'Thư mục đó không có tệp nào nên không có gì để tải lên.', folderNoSources: 'Không chọn được tệp ở đây: chưa có nguồn nào được kết nối để đọc tệp.',
    folderRefused: 'Yêu cầu này bị từ chối, và thử lại cũng không thay đổi được.',
    folderWatchedRoot: 'Thư mục theo dõi', folderWatchedEmpty: 'Không có thư mục theo dõi nào bạn được dùng.', folderNoSubfolders: 'Không có thư mục con.',
    folderLoadFailed: 'Không tải được danh sách thư mục.', folderOpen: 'Mở {name}', folderFileCountOne: '{count} tệp', folderFileCount: '{count} tệp',
    folderFilesReady: '{ready} trên {count} tệp đã sẵn sàng', folderChecking: 'Đang kiểm tra những gì sẽ được chạy…', folderPreviewFailed: 'Không kiểm tra được những gì sẽ được chạy.',
    folderPreview: 'Những gì sẽ được chạy', folderGroups: 'Thư mục', folderItems: 'Tệp', folderLeftOut: 'Bị loại ra', folderSample: 'Bắt đầu với', folderRefusal: 'Không thể khởi chạy',
    folderRefusedFilesOne: '{count} tệp quá lớn nên không được tải lên và bị loại ra.', folderRefusedFiles: '{count} tệp quá lớn nên không được tải lên và bị loại ra.',
    folderReasonNotInAFolder: 'Tệp không nằm trong thư mục nào', folderReasonNotSettled: 'Đang được chép vào, chưa sẵn sàng', folderReasonNoMarker: 'Chưa được đánh dấu là hoàn tất',
    folderReasonTooManyFiles: 'Quá nhiều tệp trong một thư mục', folderReasonBelowMinItems: 'Ít tệp hơn mức trường này nhận', folderReasonAboveMaxItems: 'Nhiều tệp hơn mức trường này nhận',
    folderReasonFileTooLarge: 'Có tệp quá lớn, không lưu được', folderReasonUploadSetIncomplete: 'Chưa tải lên xong', folderReasonNoReadyGroups: 'Chưa có gì trong đó sẵn sàng để chạy',
    folderReasonAlreadyLaunched: 'Đã có một lượt chạy bắt đầu từ lượt tải lên này; hãy tải tệp lên lại để chạy lượt khác',
    folderReasonOtherConsumers: 'Quy trình này đọc trường theo cách không dùng được thư mục',
    folderReasonMarkerNeedsFolders: 'Thư mục này chờ tệp đánh dấu hoàn tất, còn quy trình này chạy từng tệp một',
    folderReasonInUse: 'Một lượt chạy chưa xong vẫn đang đọc nó', folderReasonOther: 'Lý do khác ({code})',
    tileLoading: 'Đang tải…', tileLoadFailed: 'Không tải được ô này. Hãy tải lại trang để thử lại.', tileUnavailable: 'Không khả dụng với bạn', tileUnavailableHint: 'Ô này tính trên các bản ghi bạn không được liệt kê.',
    tileFailed: 'Không tính được ô này', tileNotDrawn: 'Chưa vẽ được ô này ở đây',
    tileNoValue: 'Không có giá trị trên tập bản ghi này', tileNoBuckets: 'Không có nhóm nào trên các bản ghi này', tileNoData: 'Không có dữ liệu',
    tileRecordsOne: '{count} bản ghi', tileRecords: '{count} bản ghi',
    tileCapAtLeast: 'ít nhất', tileCapAtMost: 'nhiều nhất', tileCapSample: 'mẫu gồm {cap} bản ghi đầu tiên', tileCapIncomplete: 'chưa đầy đủ — không có cận',
    tileChartCapAtLeast: 'Chỉ đếm tối đa {cap} bản ghi: mỗi số liệu ít nhất bằng mức hiển thị',
    tileChartCapAtMost: 'Chỉ đếm tối đa {cap} bản ghi: mỗi số liệu nhiều nhất bằng mức hiển thị',
    tileGoal: 'mục tiêu {target}', tileGoalShort: 'thiếu {distance}', tileGoalOver: 'vượt {distance}', tileGoalMet: 'đạt mục tiêu', tilePoints: '{value} điểm',
    tileVsEarlier: 'so với kỳ trước', tileEarlier: 'kỳ trước', tileNoEarlier: 'không có số liệu kỳ trước',
    tileNew: 'mới', tileGone: 'không còn', tileUnmatched: 'không có ngày tương ứng',
    tileDifference: 'chênh lệch', tileTarget: 'mục tiêu', tileBarTotal: 'tổng cột', tileFilled: 'không có bản ghi (lấp đầy)',
    tileSkipped: '{count} bản ghi bị bỏ qua: thiếu ngày', tileUnweightedAverage: 'Trung bình không trọng số của tỷ lệ từng bản ghi',
    tileUnfiltered: 'Không lọc theo bộ lọc của trang: các bản ghi này không có trường tương ứng.',
    tileDeclined: 'Hiển thị toàn bộ: ô này không theo bộ lọc của trang.',
    tileEmptied: 'Không bản ghi nào khớp cả bộ lọc của ô lẫn bộ lọc của trang.',
    tileTargetsWithheld: 'Mục tiêu lấy từ một bảng bạn không mở được', tilePartial: 'Một số bản ghi bị giữ lại với bạn và không hiển thị',
    tileBucketEmpty: '(Trống)', tileBucketRestricted: '(Bị hạn chế)', tileBucketOther: '(Khác)', tileYes: 'Có', tileNo: 'Không',
    tileListEmpty: 'Không có bản ghi nào khớp chế độ xem này.', tileListNoColumns: 'Không có cột nào của chế độ xem này hiển thị được cho bạn.', tilePrevious: 'Trước', tileNext: 'Sau', tileOpenRecord: 'Mở {label}', tileFileUnavailable: 'Tệp không khả dụng',
    tileItemsOne: '{count} mục', tileItems: '{count} mục',
    tileOpenRecordsOne: 'Nhấn để mở {count} bản ghi', tileOpenRecords: 'Nhấn để mở {count} bản ghi', tileDrillOff: 'Ô này đã tắt liên kết bản ghi',
    tileShowTable: 'Xem dạng bảng', tileShowChart: 'Xem dạng biểu đồ', tileIsolate: 'Chỉ hiện {series}', tileShowAll: 'Hiện mọi chuỗi', tileShare: 'tỷ trọng',
    tileUnitCount: 'số lượng', tileUnitRatio: 'tỷ lệ', tileUnitPercent: '%', tileUnitNumber: 'số', tileUnitDuration: 'thời lượng',
    tileUnitMinutes: 'phút', tileUnitHours: 'giờ', tileUnitDays: 'số ngày', tileUnitRating: 'đánh giá', tileUnitDate: 'ngày',
    tileRunningTotal: 'tổng luỹ kế', tileDerivedRunning: 'Tổng luỹ kế', tileRank: 'Xếp hạng', tileFormula: 'Công thức', tileFormulaNoValue: 'không có giá trị',
    tileDerivedShare: 'Tỷ trọng trên các nhóm hiển thị', tileDerivedShareRemainder: 'tỷ trọng trên các nhóm hiển thị, gồm cả phần còn lại',
    tileDerivedRank: 'Xếp hạng, {direction} trước, {ties}', tileRankHighest: 'cao nhất', tileRankLowest: 'thấp nhất',
    tileTiesDense: 'đồng hạng liền', tileTiesCompetition: 'đồng hạng bỏ thứ',
    tileVerdictPartitions: 'Các cột cộng lại bằng {total}', tileVerdictPartitionsNoTotal: 'Các cột cộng lại bằng tổng',
    tileVerdictPartitionsStacked: 'Các phân đoạn cộng lại bằng mỗi cột; các cột cộng lại bằng {total}',
    tileVerdictPartitionsStackedNoTotal: 'Các phân đoạn cộng lại bằng mỗi cột; các cột cộng lại bằng tổng',
    tileVerdictFansOut: 'Các cột cộng lại là {bucketSum}; tổng của tập bản ghi là {total}. {gap} được đếm nhiều hơn một lần.',
    tileVerdictOverlaps: 'Các nhóm chồng lấn và không thể gộp lại', tileVerdictNotApplicable: 'Không có tổng để đối chiếu',
    activity: 'Hoạt động', activityEmpty: 'Chưa có hoạt động.', activityViaAssistant: 'qua trợ lý', activityActorSomeone: 'Ai đó', activityActorSystem: 'Hệ thống', activityActorAgent: 'Tác tử',
    activityChanged: 'Đã đổi: {fields}', activityListAdded: '{field}: đã thêm “{item}”', activityListRemoved: '{field}: đã xóa “{item}”', activityListMoved: '{field}: đã chuyển “{item}”', activityListChanged: '{field}: “{item}” {column} {from} → {to}', activityListMore: '+{count} mục nữa', activityListYes: 'có', activityListNo: 'không', activityListUntitled: 'một mục',
    activityInstanceStarted: 'đã khởi tạo phiên', activityInstanceCompleted: 'đã hoàn tất phiên', activityInstanceFailed: 'đã ghi nhận phiên thất bại',
    activityInstanceCancelled: 'đã hủy phiên', activityInstancePaused: 'đã tạm dừng phiên', activityInstanceResumed: 'đã tiếp tục phiên',
    activityInstanceRetried: 'đã chạy lại phiên', activityInstanceArchived: 'đã lưu trữ phiên', activityInstanceUnarchived: 'đã khôi phục phiên từ lưu trữ',
    activityTaskCreated: 'đã tạo nhiệm vụ', activityTaskOpened: 'đã mở nhiệm vụ', activityTaskClaimed: 'đã nhận nhiệm vụ',
    activityTaskReassigned: 'đã giao lại nhiệm vụ cho {name}', activityTaskReassignFallback: 'người khác', activityTaskActionTaken: 'đã chọn “{action}”',
    activityTaskActionTakenUnknown: 'đã thực hiện một hành động', activityTaskSubmitted: 'đã gửi nhiệm vụ', activityTaskRejected: 'đã từ chối nhiệm vụ',
    activityTaskCancelled: 'đã hủy nhiệm vụ', activityTaskEscalated: 'đã chuyển cấp nhiệm vụ', activityTaskSigned: 'đã ký tài liệu',
    activityTaskSigningCancelled: 'đã hủy yêu cầu ký', activityTaskSigningFailed: 'đã ghi nhận yêu cầu ký thất bại',
    activityNodeRunStarted: 'đã bắt đầu bước', activityNodeRunCompleted: 'đã hoàn tất bước', activityNodeRunFailed: 'đã ghi nhận bước thất bại',
    activityNodeRunWaiting: 'đã để bước ở trạng thái chờ',
    activityAgentStarted: 'đã khởi chạy trợ lý AI', activityAgentSucceeded: 'đã hoàn tất lượt chạy trợ lý AI',
    activityAgentFailed: 'đã ghi nhận lượt chạy trợ lý AI thất bại', activityAgentMcpCall: 'đã gọi một công cụ bên ngoài',
    activityRecordCreated: 'đã tạo bản ghi', activityRecordUpdated: 'đã cập nhật bản ghi', activityRecordStageTransitioned: 'đã chuyển giai đoạn',
    activityRecordSeriesRaised: 'đã tạo bản ghi này từ chuỗi định kỳ {name}', activityRecordSeriesRaisedUnnamed: 'đã tạo bản ghi này từ một chuỗi định kỳ',
    activityWorkStarted: 'đã bắt đầu công việc', activityWorkAssigned: 'đã giao công việc', activityWorkClaimed: 'đã nhận công việc',
    activityWorkReleased: 'đã trả lại công việc', activityWorkReassigned: 'đã chuyển giao công việc', activityWorkCompleted: 'đã hoàn tất công việc',
    activityWorkUnassignable: 'không tìm được ai để giao công việc', activityWorkTooManyPeople: 'tìm thấy quá nhiều người để giao công việc',
    activityWorkClockStarted: 'đã bắt đầu đồng hồ hạn', activityWorkClockPaused: 'đã tạm dừng đồng hồ hạn', activityWorkClockResumed: 'đã tiếp tục đồng hồ hạn',
    activityWorkClockBreached: 'đã để công việc quá hạn', activityWorkClockStopped: 'đã dừng đồng hồ hạn', activityWorkClockCancelled: 'đã hủy đồng hồ hạn',
    activityWorkClockEscalated: 'đã leo thang công việc quá hạn', activityWorkRecipientSkipped: 'đã bỏ qua một người nhận thông báo',
    activityWorkAudienceSuppressed: 'đã giữ lại một thông báo không ai mở được', activityWorkCancelled: 'đã hủy công việc',
    activityWorkWithdrawn: 'đã rút lại công việc', activityWorkUnassigned: 'đã gỡ người được giao khỏi công việc', activityWorkOther: 'đã cập nhật công việc',
    comments: 'Bình luận', commentsEmpty: 'Chưa có bình luận.', commentEarlier: 'Xem bình luận cũ hơn', commentPlaceholder: 'Viết bình luận', commentComposerLabel: 'Viết bình luận', commentEditLabel: 'Sửa bình luận',
    commentHintSend: 'Ctrl/⌘+Enter để gửi', commentHintMention: 'Gõ @ để nhắc tên', commentSend: 'Gửi', commentSave: 'Lưu', commentEdited: 'đã sửa', commentEditedAt: 'Đã sửa {when}',
    commentEditBy: 'Sửa bình luận của {name}', commentDeleteBy: 'Xoá bình luận của {name}', commentDeleteTitle: 'Xoá bình luận này?', commentDeleteBody: 'Bình luận và các tệp của nó sẽ bị xoá với tất cả mọi người.', commentDeleteConfirm: 'Xoá',
    commentClosed: 'Bình luận đã đóng', commentClosedHint: 'Cuộc trao đổi của bản ghi này chỉ còn để đọc.', commentUnnotified: '{names} không xem được bản ghi này nên không nhận thông báo',
    commentOpenFile: 'Mở {name}', commentAttach: 'Đính kèm tệp',
    runStream: 'Tiến trình lượt chạy', runStreamWaiting: 'Đang chờ lượt chạy bắt đầu', runStreamRunning: 'Đang chạy', runStreamDone: 'Xong', runStreamStopped: 'Đã dừng',
    runStreamTool: 'Đang dùng công cụ', runStreamStepDone: '{step}: xong', runStreamStepStopped: '{step}: đã dừng', runStreamCompleted: 'Lượt chạy đã hoàn tất',
    runStreamFailed: 'Lượt chạy thất bại', runStreamCancelled: 'Lượt chạy đã bị hủy', runStreamItem: 'Mục {n}', runStreamItems: '{count} mục',
    runStreamItemsState: '{done} xong, {running} đang chạy, {failed} đã dừng', runStreamUnavailable: 'Không xem trực tiếp được tiến trình của lượt chạy này.',
  },
};

/** Whether a locale is Vietnamese (`vi`, `vi-VN`, …); the kit speaks it and English, which every other locale gets. */
export const isVi = (locale: string | null | undefined): boolean => /^vi(-|$)/i.test(locale ?? '');

export function kitText(locale: string | null | undefined, overrides?: Partial<KitStrings>): Required<KitStrings> {
  const base = KIT_TEXT[isVi(locale) ? 'vi' : 'en'];
  // An override left undefined keeps the language's own string.
  const given = Object.fromEntries(Object.entries(overrides ?? {}).filter(([, v]) => v !== undefined));
  return { ...base, ...given };
}

/** `text[key]`, or the English text where a page's strings blanked it: a form control's validation message cannot be empty. */
export function orEnglish(text: Required<KitStrings>, key: keyof KitStrings): string {
  return text[key] || KIT_TEXT.en[key];
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => String(values[key] ?? whole));
}
