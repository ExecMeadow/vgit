import resolvePositionals from "./engine/resolvePositionals.js";
import { Error } from "./types.js";

export default function printHelp(
  positionals: string[],
): { error: Error; output: undefined } | { error: undefined; output: string } {
  const { error: argsError, node } = resolvePositionals(positionals);
  if (argsError) {
    return { error: argsError, output: undefined };
  }
  if (node.leaf) {
    return { output: `Usage: ${node.leaf.usage}`, error: undefined };
  }
  if (node) {
    return {
      output: `Available completions: ${Object.keys(node)}`,
      error: undefined,
    };
  }
  return {
    error: { code: "UNKNOWN", message: "unexpected error" },
    output: undefined,
  };
}
