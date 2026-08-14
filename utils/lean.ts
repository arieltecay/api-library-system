/**
 * Mongoose .lean() skips toJSON transforms, so `_id` is not mapped to `id`.
 * These helpers normalize lean documents to match the API contract (id: string).
 */

export function withId<T extends Record<string, any>>(doc: T | null | undefined): any {
  if (!doc) return doc;
  const result: any = { ...doc, id: String(doc._id) };
  delete result._id;
  delete result.__v;
  return result;
}

export function withIds<T extends Record<string, any>>(docs: T[]): any[] {
  return docs.map(withId);
}
