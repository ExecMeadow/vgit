import {
  Error,
  EnvironmentContext,
  GitCommand,
  GitCommandId,
  InputOutputContracts as IO,
} from "../types.js";

export default async function execute<Id extends GitCommandId>(
  command: GitCommand<Id>,
  inputs: IO[Id]["input"],
  context: EnvironmentContext,
): Promise<
  | { data: IO[Id]["output"]; commandId: Id; error?: never }
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
