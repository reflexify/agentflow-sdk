import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as stampCompletion from "./config/build/stamp-completion.mjs";
import * as freezeOnClose from "./config/build/freeze-on-close.mjs";

export default defineApp({
  sections: merge([stampCompletion, freezeOnClose], ["stamp_completion", "freeze_on_close", "unfreeze_on_reopen"]),
});
