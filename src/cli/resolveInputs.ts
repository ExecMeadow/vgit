import { GitCommandId, InputOutputContracts as IO, Error } from "../types.js";
import { inputOutputContracts } from "../gitCommandTree.js";

export default function resolveInputs<Id extends GitCommandId>(
  commandId: Id,
  params: string[],
):
  | { inputs: IO[Id]["input"]; error?: never }
  | { error: Error; inputs?: never } {
  const inputKeys = Object.keys(inputOutputContracts[commandId].input);
  if (params.length !== inputKeys.length) {
    return {
      error: {
        code: "INVALID_INPUT",
        message: `Invalid input. Expected number of inputs: ${inputKeys.length}. Received: ${params.length}.`,
      },
    };
  }
  const keyValuePairs = inputKeys.map((inputKey, i) => {
    return [inputKey, params[i]];
  });
  const inputs: IO[Id]["input"] = Object.fromEntries(keyValuePairs);
  return { inputs };
}
