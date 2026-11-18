import { Command } from "../types.js";
import {verify} from "./validation.js";
import renderer from "../terminal-ui/renderer.js";

export default async function executor(command: Command, params: string[]) {
  const result = await command.execute(params);
  const { error } = verify.isValidResult(result);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  renderer(result.outputs);
}
