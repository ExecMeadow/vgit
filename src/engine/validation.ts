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
function isValidTerminalOutputType(type: unknown): type is string {
  const allowedTypes = ["text", "indentedList", "numberedList"];
  if (!isString(type)) {
    return false;
  }
  if (!(type in allowedTypes)) {
    return false;
  }
  return true;
}
function isValidTerminalOutput(terminalOutput: unknown) {
  if (!isObject(terminalOutput)) {
    return false;
  }
  if (!isValidTerminalOutputType(terminalOutput.type)) {
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

// Engine validation
function isValidNodeType(type: unknown) {
  if (!isString(type)) {
    return false;
  }
  if (type !== "group" && type !== "command") {
    return false;
  }
  return true;
}
function isValidNodeDescription(description: unknown) {
  if (!isString(description)) {
    return false;
  }
  return true;
}
function isValidNode(
  node: unknown,
): node is GitCommandTree | GitCommand<GitCommandId> {
  if (!isObject(node)) {
    return false;
  }
  if (!hasKeys(node, ["type", "description"])) {
    return false;
  }
  if (!isValidNodeType(node.type)) {
    return false;
  }
  if (!isValidNodeDescription(node.description)) {
    return false;
  }
  return true;
}
function isValidCommandNode(node: unknown): boolean {
  if (!isValidNode(node)) {
    return false;
  }
  if (!hasExactKeys(node, ["id", "type", "description", "usage", "execute"])) {
    return false;
  }
  if (!isString(node.id)) {
    return false;
  }
  if (node.type !== "command") {
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
  isValidCommandTree(tree: unknown): { error?: Error } {
    if (!isValidNode(tree)) {
      return {
        error: {
          code: "INVALID_TREE",
          message: `Expected a valid node, Received: ${tree}`,
        },
      };
    }
    if (tree.type === "command") {
      return {
        error: {
          code: "INVALID_TREE",
          message: `Received node of type command instead of group.`,
        },
      };
    }
    const { error: treeError } = recurseCommandTree(tree);
    if (treeError) {
      return { error: treeError };
    }
    return {};
  },
};

function recurseCommandTree(tree: GitCommandTree): { error?: Error } {
  // Traverse command tree.
  const nextNodesArray = Object.values(tree);
  for (const nextNode of nextNodesArray) {
    // Skip properties.
    if (!nextNode || typeof nextNode === "string") {
      continue;
    }
    // Halt once command is detected.
    if (nextNode.type === "command") {
      if (!isValidCommandNode(nextNode)) {
        return {
          error: {
            code: "INVALID_TREE",
            message: `Invalid command node: ${nextNode}`,
          },
        };
      }
      continue;
    } else {
      if (!isValidNode(nextNode)) {
        return {
          error: {
            code: "INVALID_TREE",
            message: `Invalid group node: ${nextNode}`,
          },
        };
      }
      // Continue traversing.
      return recurseCommandTree(nextNode);
    }
  } // End of Traversal.
  return {};
}
