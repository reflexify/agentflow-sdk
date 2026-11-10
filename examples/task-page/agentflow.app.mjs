import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as reviewRequest from "./config/build/review-request.mjs";

export default defineApp({
  sections: merge([reviewRequest], ["review_request"]),
});
