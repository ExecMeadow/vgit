import resolvePositionals from "./engine/resolvePositionals.js";
import { Error, Output } from "./types.js";
import discoverCommands, { getCommandListOutputs } from "./discoverCommands.js";

export default function printHelp(
  positionals: string[],
): { error: Error; outputs?: never } | { outputs: Output[]; error?: never } {
  const { error: argsError, node } = resolvePositionals(positionals);
  if (argsError) {
    return { error: argsError };
  }
  const commands = discoverCommands(node, [positionals.join(" ")]);
  const commandSuggestions = getCommandListOutputs(commands);
  if (positionals.length === 0) {
    return {
      outputs: [
        { type: "text", value: "Usage: vgit <domain> <action>" },
        { type: "text", value: "" },
        ...commandSuggestions,
      ],
    };
  }
  if (node.leaf) {
    return {
      outputs: [
        {
          type: "text",
          value: `Usage: ${node.leaf.usage}\nDescription: ${node.leaf.description}`,
        },
      ],
    };
  }
  if (node) {
    return { outputs: commandSuggestions };
  }
  return {
    error: { code: "UNKNOWN", message: "unexpected error" },
  };
}
