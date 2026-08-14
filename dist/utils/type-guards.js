export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function isString(value) {
    return typeof value === 'string';
}
export function isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
}
export function isBoolean(value) {
    return typeof value === 'boolean';
}
export function isNonEmptyString(value) {
    return isString(value) && value.trim().length > 0;
}
export function isPositiveNumber(value) {
    return isNumber(value) && value > 0;
}
export function isNonNegativeNumber(value) {
    return isNumber(value) && value >= 0;
}
export function hasProperty(obj, key) {
    return isRecord(obj) && key in obj;
}
export function assertIsRecord(value, message = 'Expected a record') {
    if (!isRecord(value)) {
        throw new Error(message);
    }
}
export function assertIsString(value, message = 'Expected a string') {
    if (!isString(value)) {
        throw new Error(message);
    }
}
export function assertIsNumber(value, message = 'Expected a number') {
    if (!isNumber(value)) {
        throw new Error(message);
    }
}
//# sourceMappingURL=type-guards.js.map