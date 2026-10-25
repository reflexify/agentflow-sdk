import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as approveLeave from "./config/build/approve-leave.mjs";

export default defineApp({
  sections: merge([approveLeave], ["approve_leave"]),
  exposedSteps: { approve_leave: ["decide"] },
});
