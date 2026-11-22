import {
  Error,
  EnvironmentContext,
  GitCommand,
  GitCommandId,
  Data,
} from "../types.js";

export default async function execute(
  command: GitCommand,
  inputs: Data,
  context: EnvironmentContext,
): Promise<
  | { data: Data; commandId: GitCommandId; error?: never }
  | { error: Error; data?: never; commandId?: never }
> {
  try {
    const { error: executionError, data } = await command.execute(
      inputs,
      context,
    );
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
