import { GitCommandTree, GitCommand, GitCommandId, Error } from "../types.js";
import commandTree from "../gitCommandTree.js";

export default function resolvePositionals(positionals: string[]):
  | { error: Error; node?: never; params?: never }
  | {
      node: GitCommandTree | GitCommand<GitCommandId>;
      params: string[];
      error?: never;
    } {
  let currentNode: GitCommandTree = commandTree;
  // Traverse command tree.
  for (let i = 0; i < positionals.length; i++) {
    const nextNode = currentNode[positionals[i]];
    if (!nextNode) {
      // Return error.
      const error = getError({
        positionals,
        code: "ARGS_ERROR",
      });
      return { error };
    }
    if (typeof nextNode != "string" && nextNode.type === "group") {
      // Continue traversing.
      currentNode = nextNode;
    } else if (typeof nextNode !== "string" && nextNode.type === "command") {
      // Return command definition.
      const params = positionals.slice(i + 1);
      return { node: nextNode, params };
    }
  }
  // Return segment.
  return { node: currentNode, params: [] };
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
  if (code === "ARGS_ERROR") {
    message = "Command does not exist. ";
  }
  const error = { code, message: message + ` Received: "${command}".` };
  return error;
}
