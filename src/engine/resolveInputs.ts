import { GitCommandId, Error } from "../types.js";

export default function resolveInputs(
  commandId: GitCommandId,
  params: string[],
):
  | { inputs: Record<string, string>; error?: never }
  | { error: Error; inputs?: never } {
  const expectedInputs = expectedGitCommandInputs[commandId];
  if (params.length !== expectedInputs.length) {
    return {
      error: {
        code: "INVALID_INPUT",
        message: `Invalid input. Expected number of inputs: ${expectedInputs.length}. Recieved: ${params.length}.`,
      },
    };
  }
  const inputs: Record<string, string> = {};
  expectedInputs.forEach((expectedInput: string, i: number) => {
    inputs[expectedInput] = params[i];
  });
  return { inputs };
}

// expected git command inputs
const expectedGitCommandInputs = {
  "branch-list": [],
  "branch-create": ["branchName"],
  "branch-delete": ["branchName"],
};
