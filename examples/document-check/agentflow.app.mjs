import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as checkSubmission from "./config/build/check-submission.mjs";

export default defineApp({
  sections: merge([checkSubmission], ["check_submission"]),
});
