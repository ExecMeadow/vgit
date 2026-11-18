import resolveArgs from "./resolveArgs.js";
import executor from "./executor.js";

export default function core(args: string[]) {
  const { error: argsError, command, params } = resolveArgs(args);

  if (argsError) {
    console.error(argsError.message);
    process.exit(1);
  }

  executor(command, params);
}
