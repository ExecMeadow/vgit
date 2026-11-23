import { GitCommandId, GitCommandInput, Error } from "../types.js";

export default function resolveInputs<Id extends GitCommandId>(
  commandId: Id,
  params: string[],
):
  | { inputs: GitCommandInput[Id]; error?: never }
  | { error: Error; inputs?: never } {
  const inputKeys = getExpectedGitCommandInputKeys[commandId];
  if (params.length !== inputKeys.length) {
    return {
      error: {
        code: "INVALID_INPUT",
        message: `Invalid input. Expected number of inputs: ${inputKeys.length}. Recieved: ${params.length}.`,
      },
    };
  }

  const keyValuePairs = inputKeys.map((inputKey, i) => {
    return [inputKey, params[i]];
  });
  const inputs = Object.fromEntries(keyValuePairs) as GitCommandInput[Id];

  return { inputs };
}

// expected git command inputs
const getExpectedGitCommandInputKeys = {
  "branch-list": [],
  "branch-create": ["branchName"],
  "branch-delete": ["branchName"],
} satisfies Record<GitCommandId, string[]>;
