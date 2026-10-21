/** An object-valued prop, or undefined; a string (an attribute in markup) is ignored. */
export declare function objectProp<T extends object>(value: unknown, name: string): T | undefined;
/**
 * A page size the API accepts, 1 to 200. A removed attribute arrives as null, which a `$props`
 * default does not cover, so null, undefined and anything that is not a number mean 25.
 */
export declare function pageSizeProp(value: unknown): number;
/** A function-valued prop, or undefined; a string (an attribute in markup) is ignored. */
export declare function functionProp<T extends (...args: never[]) => unknown>(value: unknown, name: string): T | undefined;
//# sourceMappingURL=props.d.ts.map