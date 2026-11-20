import { CommandTree, Output } from "./types.js";
//import { verify } from "./engine/validation.js";

export default function discoverCommands(
  node: CommandTree,
  path: string[] = [],
): string[] {
  // halt at leaf, don't traverse!
  if (node.leaf) {
    return [path.join(" ")];
  } else {
    const keyValuePairs = Object.entries(node);
    const commands: string[] = keyValuePairs.flatMap((pair) => {
      // for each pair
      const [key, child] = pair;
      // build command
      const currentPath = [...path, key];
      if (!child) {
        return [];
      }
      // halt once leaf is detected
      //if(verify.isLeaf(node)){
      //  return [currentPath.join(" ")];
      //}
      // otherwise, continue traversing
      return discoverCommands(child, currentPath);
    });
    return commands;
  }
}

export function getCommandListOutputs(commandList: string[]): Output[] {
  const output: Output[] = [];
  output.push({ type: "text", value: "Available commands: " });
  output.push({
    type: "text",
    value: `${commandList.length} command${commandList.length === 1 ? "" : "s"} found.`,
  });
  const commandsOutput: Output = {
    type: "indentedList",
    values: commandList,
  };
  return [...output, commandsOutput];
}
