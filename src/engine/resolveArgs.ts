import { Segment } from "../types.js";

import commands from "../dictionary.js";

export default function resolveArgs(args: string[]) {
  let currentNode: Segment | undefined = commands;
  // Traverse dictionary until command is found.
  for (let i = 0; i < args.length; i++) {
    if (!currentNode) {
      continue;
    }
    currentNode = currentNode[args[i]] as Segment | undefined;
    if (currentNode?.command) {
      // Reached a command definition
      const command = currentNode.command;
      const params = args.splice(i + 1);
      return { command, params };
    }
  }
  // Ended on a segment
  const errorMessage = getErrorMessage({
    args,
    message: "The args did not map to a command.",
  });
  return { error: { message: errorMessage } };
}

function getErrorMessage({
  args,
  message,
}: {
  args: string[];
  message: string;
}) {
  // Capture verb as a string.
  const command = args.join(" ");
  const errorMessage = message + ` Received: "${command}".`;
  return errorMessage;
}
