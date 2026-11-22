import { GitCommandTree } from "../types.js";

export default function discoverCommands(
  node: GitCommandTree,
  path: string[] = [],
): string[] {
  // halt at leaf, don't traverse!
  const keyValuePairs = Object.entries(node);
  const commands: string[] = keyValuePairs.flatMap((pair) => {
    const [key, nextNode] = pair;
    // Build command.
    const currentPath = [...path, key];
    if (!nextNode || typeof nextNode === "string") {
      return [];
    }
    // Halt once command is detected.
    if (nextNode.type === "command") {
      return [currentPath.join(" ")];
    }
    // Continue traversing.
    return discoverCommands(nextNode, currentPath);
  });
  return commands;
}
