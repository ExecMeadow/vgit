import resolveArgs from "./resolveArgs.js";
import executor from "./executor.js";

export default async function core(args: string[]) {
  const { error: argsError, command, params } = resolveArgs(args);

  if (argsError) {
    return {
      error: {
        type: "Argument resolution error: ",
        message: argsError.message,
      },
    };
  }

  return await executor(command, params);
}
