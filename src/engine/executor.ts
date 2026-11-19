import { Command } from "../types.js";
import { verify } from "./validation.js";

export default async function executor(command: Command, params: string[]) {
  const result = await command.execute(params);
  const { error: resultError } = verify.isValidResult(result);

  if (resultError) {
    return {
      error: { type: "Invalid command result: ", message: resultError.message },
    };
  }

  return { result: result.outputs };
}
