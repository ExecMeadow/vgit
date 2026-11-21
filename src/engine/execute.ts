import { Error, GitCommand, GitCommandId, Data } from "../types.js";
//import { verify } from "./validation.js";

export default async function execute(
  command: GitCommand,
  params: string[],
): Promise<{ error: Error; data?: never; commandId?: never } | { data: Data; commandId: GitCommandId; error?: never }> {
  try {
    const { error: executionError, data } = await command.execute(params);
    if (executionError) {
      return {
        error: {
          code: "EXECUTION_FAILED",
          message: `Failed to execute command: ${command}\n\n${executionError.message}`,
        },
      };
    }
    return { data, commandId: command.id };
  } catch (err) {
    return {
      error: {
        code: "EXECUTION_FAILED",
        message: `Failed to execute command: ${command}\n\n${err}`,
      },
    };
  }
}
