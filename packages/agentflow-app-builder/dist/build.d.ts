import { type ActionSource, type TriggerSource, type WorkflowSource } from "./workflow.js";
export interface Sections {
    workflows: Record<string, WorkflowSource>;
    order: string[];
    triggers: Record<string, TriggerSource>;
    actions: Record<string, ActionSource>;
}
export interface BuildOptions {
    configDir: string;
    sections: Sections;
    exposedSteps?: Record<string, string[]>;
    entityOrder?: string[];
}
export declare function merge(sectionModules: Partial<Sections>[], order: string[]): Sections;
export declare function buildPackage({ configDir, sections, exposedSteps, entityOrder }: BuildOptions): Record<string, string>;
export declare function writePackage(options: BuildOptions, packageDir: string): number;
//# sourceMappingURL=build.d.ts.map