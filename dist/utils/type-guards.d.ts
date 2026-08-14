export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function isString(value: unknown): value is string;
export declare function isNumber(value: unknown): value is number;
export declare function isBoolean(value: unknown): value is boolean;
export declare function isNonEmptyString(value: unknown): value is string;
export declare function isPositiveNumber(value: unknown): value is number;
export declare function isNonNegativeNumber(value: unknown): value is number;
export declare function hasProperty<T extends string>(obj: unknown, key: T): obj is Record<T, unknown>;
export declare function assertIsRecord(value: unknown, message?: string): asserts value is Record<string, unknown>;
export declare function assertIsString(value: unknown, message?: string): asserts value is string;
export declare function assertIsNumber(value: unknown, message?: string): asserts value is number;
//# sourceMappingURL=type-guards.d.ts.map