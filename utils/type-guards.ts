export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

export function hasProperty<T extends string>(obj: unknown, key: T): obj is Record<T, unknown> {
  return isRecord(obj) && key in obj;
}

export function assertIsRecord(value: unknown, message = 'Expected a record'): asserts value is Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(message);
  }
}

export function assertIsString(value: unknown, message = 'Expected a string'): asserts value is string {
  if (!isString(value)) {
    throw new Error(message);
  }
}

export function assertIsNumber(value: unknown, message = 'Expected a number'): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message);
  }
}