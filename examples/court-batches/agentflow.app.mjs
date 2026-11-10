import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as addDossiers from "./config/build/add-dossiers.mjs";
import * as openDossier from "./config/build/open-dossier.mjs";

export default defineApp({
  sections: merge([openDossier, addDossiers], ["open_dossier", "add_dossiers"]),
  entityOrder: ["batch", "dossier"],
});
