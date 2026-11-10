import { defineApp, merge } from "@reflexify/agentflow-app-builder";

// A UI module and nothing else: no workflow, so the sections are empty.
export default defineApp({
  sections: merge([], []),
});
