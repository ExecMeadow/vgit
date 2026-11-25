// validate.ts
import {
  Error,
  GitCommandTree,
  GitCommand,
  GitCommandId,
  IOValidation,
} from "../types.js";

/* Utility */
export const utils = {
  isObject,
  hasKeys,
  hasExactKeys,
  isString,
  isArray,
  isStringArray,
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
function isStringArray(arr: unknown[]) {
  return arr.every((element) => typeof element === "string");
}

// function validation
function isFunction(fun: unknown) {
  return typeof fun === "function";
}

// Engine validation
export const engine = {
  isValidNodeType,
  isValidNodeDescription,
  isValidNode,
  isValidCommandNode,
};
function isValidNodeType(type: unknown) {
  if (!isString(type)) {
    return false;
  }
  if (
    type !== "group" &&
    type !== "command" &&
    type !== "domain" &&
    type !== "root"
  ) {
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
function isValidCommandNode(node: unknown) {
  if (!isValidNode(node)) {
    return false;
  }
  if (
    !hasExactKeys(node, ["id", "type", "description", "usage", "io", "execute"])
  ) {
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
  if (!isValidIO(node.io)) {
    return false;
  }
  if (!isFunction(node.execute)) {
    return false;
  }
  return true;
}

// Command IO validation
function isValidIO(io: unknown) {
  if (!isObject(io)) {
    return false;
  }
  if (!hasExactKeys(io, ["input", "output"])) {
    return false;
  }
  if (!isObject(io.input)) {
    return false;
  }
  if (!isObject(io.output)) {
    return false;
  }
  return true;
}
function isValidUserInput<Id extends GitCommandId>(
  userInput: unknown,
  expectedInput: IOValidation[Id]["input"],
) {
  if (!isObject(userInput)) {
    return false;
  }
  const inputEntries = Object.entries(expectedInput);
  for (const [key, entry] of inputEntries) {
    // required and exists
    if (entry.isRequired && !userInput[key]) {
      return false;
    }
    // valid regardless required or not
    if (!entry.isValid(userInput[key])) {
      return false;
    }
  }
  return true;
}

export const verify = {
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
  isValidUserInput(
    userInput: unknown,
    expectedInput: IOValidation[GitCommandId]["input"],
  ) {
    const isValid = isValidUserInput(userInput, expectedInput);
    if (!isValid) {
      return {
        error: {
          code: "INVALID_USER_INPUT",
          message: `Invalid user input. Expected: ${JSON.stringify(expectedInput)} Received: ${JSON.stringify(userInput)}`,
        },
      };
    }
    return {};
  },
};

// Utility
function recurseCommandTree(tree: GitCommandTree): { error?: Error } {
  const commandIDs = [];
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
            message: `Invalid command node: ${JSON.stringify(nextNode)}`,
          },
        };
      }
      commandIDs.push(nextNode.id);
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
  const isUniqueList = (list: string[]) => new Set(list).size === list.length;
  if (!isUniqueList(commandIDs)) {
    return {
      error: { code: "INVALID_ID", message: "Command IDs are not unique." },
    };
  }
  return {};
}
