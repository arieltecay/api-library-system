/**
 * Mongoose .lean() skips toJSON transforms, so `_id` is not mapped to `id`.
 * These helpers normalize lean documents to match the API contract (id: string).
 */
export declare function withId<T extends Record<string, any>>(doc: T | null | undefined): any;
export declare function withIds<T extends Record<string, any>>(docs: T[]): any[];
//# sourceMappingURL=lean.d.ts.map