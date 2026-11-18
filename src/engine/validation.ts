// validate.ts
import { Output } from "../types.js";

// Object validation
function isObject(obj: unknown) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
function hasExactKeys(obj: object, keys: string[]) {
  return (
    Object.keys(obj).length === keys.length &&
    keys.every((key) => Object.hasOwn(obj, key))
  );
}

// String validation
function isString(str: unknown) {
  return typeof str === "string";
}

// Array validation
function isArray(arr: unknown) {
  return Array.isArray(arr);
}
function isStringArray(arr: string[]) {
  return arr.every((element) => typeof element === "string");
}

// Result validation
function isValidOutput(output: Output) {
  if (!isObject(output)) {
    return false;
  }
  if (output.type === "text") {
    if (!hasExactKeys(output, ["type", "value"])) {
      return false;
    }
    if (!isString(output.value)) {
      return false;
    }
  } else if (output.type === "indentedList" || output.type === "numberedList") {
    if (!hasExactKeys(output, ["type", "values"])) {
      return false;
    }
    if (!isArray(output.values)) {
      return false;
    }
    if (!isStringArray(output.values)) {
      return false;
    }
  }

  return true;
}
function isOutputArray(outputs: Output[]) {
  return outputs.every((output) => isValidOutput(output));
}
function isValidResult(result: { command: string; outputs: Output[] }) {
  if (!isObject(result)) {
    return false;
  }
  if (!hasExactKeys(result, ["command", "outputs"])) {
    return false;
  }
  if (!isString(result.command)) {
    return false;
  }
  if (!isOutputArray(result.outputs)) {
    return false;
  }
  return true;
}

const verify = {
  isValidResult(result: { command: string; outputs: Output[] }) {
    if (!isValidResult(result)) {
      return {error: {message: `Result is invalid. Received: ${result}`}};
    }
    return {error: null};
  },
};

export { verify };
