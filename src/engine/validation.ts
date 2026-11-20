// validate.ts
import { Output, CommandTree, Leaf } from "../types.js";

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

// function validation
function isFunction(fun: unknown) {
  return typeof fun === "function";
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

const verify = {
  isValidCommandOutputArray(outputs: Output[]) {
    if (!isOutputArray(outputs)) {
      return {
        error: { message: `Output array is invalid. Received: ${outputs}` },
      };
    }
    return { error: null };
  },
  isLeaf(node: CommandTree | Leaf): node is Leaf {
    if (!isObject(node)) {
      return false;
    }
    if (!hasExactKeys(node, ["execute", "usage", "description"])) {
      return false;
    }
    if (!isString(node.description)) {
      return false;
    }
    if (!isFunction(node.execute)) {
      return false;
    }
    return true;
  },
};

export { verify };
