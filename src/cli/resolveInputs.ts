import {
  GitCommandId,
  InputOutputContracts as IO,
  IOValidation,
  Error,
} from "../types.js";

import { verify } from "../engine/validation.js";

export default function resolveInputs<Id extends GitCommandId>(
  expectedInput: IOValidation[Id]["input"],
  params: string[],
):
  | { userInput: IO[Id]["input"]; error?: never }
  | { error: Error; userInput?: never } {
  const expectedInputKeys = Object.keys(expectedInput);
  if (params.length > expectedInputKeys.length) {
    return {
      error: {
        code: "INVALID_INPUT",
        message: `Invalid input. Expected number of inputs: ${expectedInputKeys.length}. Received: ${params.length}.`,
      },
    };
  }

  const keyValuePairs = expectedInputKeys.map((inputKey, i) => {
    return [inputKey, params[i]];
  });
  const userInput: IO[Id]["input"] = Object.fromEntries(keyValuePairs);
  const { error: inputError } = verify.isValidUserInput(
    userInput,
    expectedInput,
  );
  if (inputError) {
    return { error: inputError };
  }
  return { userInput };
}
