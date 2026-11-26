/* Utility */
export const utils = {
  isObject,
  hasKeys,
  hasExactKeys,
  isString,
  isArray,
  isArrayOfStrings,
  isArrayOfObjects,
  isBoolean,
  isFunction,
};
// Object validation
function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
function hasKeys(obj: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => Object.hasOwn(obj, key));
}
function hasExactKeys(obj: Record<string, unknown>, keys: string[]) {
  return Object.keys(obj).length === keys.length && hasKeys(obj, keys);
}

// String validation
function isString(str: unknown): str is string {
  return typeof str === "string";
}

// Array validation
function isArray(arr: unknown): arr is unknown[] {
  return Array.isArray(arr);
}
function isArrayOfStrings(arr: unknown[]): arr is string[] {
  return arr.every((element) => isString(element));
}
function isArrayOfObjects(arr: unknown[]): arr is Record<string, unknown>[] {
  return arr.every((element) => isObject(element));
}

// Boolean validation
function isBoolean(b: unknown): b is boolean {
  return typeof b === "boolean";
}

// Function validation
function isFunction(fun: unknown) {
  return typeof fun === "function";
}
