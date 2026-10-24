import { type EntitySource } from "./invariants.js";
export interface FilterSurface {
    entityKey: string;
    file: EntitySource;
    sources: ReadonlyMap<string, EntitySource>;
    where: string;
    preset: boolean;
}
export declare function checkFilterRule(rule: unknown, surface: FilterSurface, pointer: string): void;
//# sourceMappingURL=view-filters.d.ts.map