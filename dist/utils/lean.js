/**
 * Mongoose .lean() skips toJSON transforms, so `_id` is not mapped to `id`.
 * These helpers normalize lean documents to match the API contract (id: string).
 */
export function withId(doc) {
    if (!doc)
        return doc;
    const result = { ...doc, id: String(doc._id) };
    delete result._id;
    delete result.__v;
    return result;
}
export function withIds(docs) {
    return docs.map(withId);
}
//# sourceMappingURL=lean.js.map