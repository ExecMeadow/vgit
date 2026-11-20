import { Output, Error } from "../types.js";

import terminalUITree from "./terminalUITree.js";

export default function resolvePositionals(
  positionals: string[],
  data: unknown,
): { error: Error; outputs?: never } | { outputs: Output[]; error?: never } {
  let currentNode = terminalUITree;
  // Traverse UI tree.
  for (let i = 0; i < positionals.length; i++) {
    const nextNode = currentNode[positionals[i]];
    // Stop at undefined.
    if (!nextNode) {
      // Return error.
      const error = getError({
        positionals,
        code: "ARGS_ERROR",
      });
      return { error };
    }
    if (typeof nextNode !== "function") {
      // Continue traversing.
      currentNode = nextNode;
    } else {
      // Return UI.
      return { outputs: nextNode(data) };
    }
  }
  // Stopped at a segment.
  // Return error.
  const error = getError({ positionals, code: "UNEXPECTED_ERROR" });
  return { error };
}

function getError({
  positionals,
  code,
}: {
  positionals: string[];
  code: string;
}) {
  // Capture command as a string.
  const command = positionals.join(" ");
  let message = "";
  switch (code) {
    case "ARGS_ERROR": {
      message = "UI does not exist.";
      break;
    }
    case "UNEXPECTED_ERROR": {
      message = "Unexpected error.";
      break;
    }
  }
  const error = { code, message: message + ` Received: "${command}".` };
  return error;
}
