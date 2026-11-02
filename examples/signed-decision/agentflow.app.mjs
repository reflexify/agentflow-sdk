import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as signDecision from "./config/build/sign-decision.mjs";

export default defineApp({
  sections: merge([signDecision], ["sign_decision"]),
});
