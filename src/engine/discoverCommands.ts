import { GitCommandTree } from "../types.js";

export default function discoverCommands(
  node: GitCommandTree,
  path: string[] = [],
): string[] {
  const commands = recurseCommandTree(node, path);
  return commands;
}

function recurseCommandTree(
  tree: GitCommandTree,
  path: string[] = [],
): string[] {
  // Traverse command tree.
  const keyValuePairs = Object.entries(tree);
  return keyValuePairs.flatMap((pair) => {
    const [key, nextNode] = pair;
    const currentPath = [...path, key];
    // Skip properties.
    if (!nextNode || typeof nextNode === "string") {
      return [];
    }
    // Halt once command is detected.
    if (nextNode.type === "command") {
      return [currentPath.join(" ")];
    } else {
      // Continue traversing.
      return recurseCommandTree(nextNode, currentPath);
    }
  });
}
