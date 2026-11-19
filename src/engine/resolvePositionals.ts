import { Segment, Error } from "../types.js";

import commands from "../dictionary.js";

export default function resolvePositionals(
  positionals: string[],
):
  | { error: Error; node?: never; params?: never }
  | { node: Segment; params: string[]; error?: never } {
  let currentNode: Segment | undefined = commands;
  // Traverse dictionary, halt when leaf is found.
  for (let i = 0; i < positionals.length; i++) {
    currentNode = currentNode[positionals[i]] as Segment | undefined;
    if (currentNode?.leaf) {
      // Reached a command definition
      const params = positionals.slice(i + 1);
      return { node: currentNode, params };
    }
    if (!currentNode) {
      // segment does not exist
      const errorMessage = getErrorMessage({
        positionals,
        message: "Command does not exist.",
      });
      return { error: { code: "ARGS_ERROR", message: errorMessage } };
    }
  }
  // Ended on a segment
  return { node: currentNode, params: [] };
}

function getErrorMessage({
  positionals,
  message,
}: {
  positionals: string[];
  message: string;
}) {
  // Capture verb as a string.
  const args = positionals.join(" ");
  const errorMessage = message + ` Received: "${args}".`;
  return errorMessage;
}
