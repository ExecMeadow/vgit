import { Error, Output, CommandTree, Leaf } from "../types.js";
import { verify } from "./validation.js";

function getCommandFromNode(
  currentNode: CommandTree,
): { error: Error; command?: never } | { command: Leaf; error?: never } {
  if (!currentNode.leaf) {
    return {
      error: { code: "LEAF_NOT_FOUND", message: `Command is incomplete.` },
    };
  }
  return { command: currentNode.leaf };
}

async function execute(
  command: Leaf,
  params: string[],
): Promise<
  { error: Error; outputs?: never } | { outputs: Output[]; error?: never }
> {
  const result = await command.execute(params);
  const { error: resultError } = verify.isValidCommandOutputArray(
    result.outputs,
  );
  if (resultError) {
    return {
      error: { code: "COMMAND_FAILED", message: resultError.message },
    };
  }
  return { outputs: result.outputs };
}

export { execute, getCommandFromNode };
