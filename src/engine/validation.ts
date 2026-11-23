// validate.ts
import { Error, GitCommandTree, GitCommand, GitCommandId } from "../types.js";

// Object validation
function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
function hasKeys(obj: object, keys: string[]) {
  return keys.every((key) => Object.hasOwn(obj, key));
}
function hasExactKeys(obj: object, keys: string[]) {
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
function isStringArray(arr: unknown[]) {
  return arr.every((element) => typeof element === "string");
}

// function validation
function isFunction(fun: unknown) {
  return typeof fun === "function";
}

// UI validation
function isValidTerminalOutput(terminalOutput: unknown) {
  if (!isObject(terminalOutput)) {
    return false;
  }
  if (terminalOutput.type === "text") {
    if (!hasExactKeys(terminalOutput, ["type", "value"])) {
      return false;
    }
    if (!isString(terminalOutput.value)) {
      return false;
    }
  } else if (
    terminalOutput.type === "indentedList" ||
    terminalOutput.type === "numberedList"
  ) {
    if (!hasExactKeys(terminalOutput, ["type", "values"])) {
      return false;
    }
    if (!isArray(terminalOutput.values)) {
      return false;
    }
    if (!isStringArray(terminalOutput.values)) {
      return false;
    }
  }

  return true;
}
function isTerminalOutputArray(terminalOutputs: unknown[]) {
  return terminalOutputs.every((output) => isValidTerminalOutput(output));
}

// engine validation
function isNode(
  node: unknown,
): node is GitCommandTree | GitCommand<GitCommandId> {
  if (!isObject(node)) {
    return false;
  }
  if (!hasKeys(node, ["type", "description"])) {
    return false;
  }
  return true;
}
function isGitCommand(node: unknown): boolean {
  if (!isObject(node)) {
    return false;
  }
  if (!hasExactKeys(node, ["type", "id", "description", "usage", "execute"])) {
    return false;
  }
  if (node.type !== "command") {
    return false;
  }
  if (!isString(node.id)) {
    return false;
  }
  if (!isString(node.description)) {
    return false;
  }
  if (!isString(node.usage)) {
    return false;
  }
  if (!isFunction(node.execute)) {
    return false;
  }
  return true;
}
function isGroupNode(node: unknown) {
  if (!isNode(node)) {
    return false;
  }
  if (node.type !== "group") {
    return false;
  }
  return true;
}

export const verify = {
  areValidTerminalOutputs(outputs: unknown[]): { error?: Error } {
    if (!isTerminalOutputArray(outputs)) {
      return {
        error: {
          code: "INVALID_OUTPUT",
          message: `Output array is invalid. Received: ${outputs}`,
        },
      };
    }
    return {};
  },
  isValidCommandTree(node: unknown): { error?: Error } {
    if (!isGitCommand(node) && !isGroupNode(node)) {
      return {
        error: {
          code: "INVALID_TREE",
          message: "Implementation error. Git command tree is invalid.",
        },
      };
    }
    return {};
  },
};
