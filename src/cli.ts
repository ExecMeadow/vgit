#!/usr/bin/env node

import { parseArgs } from "node:util";
import packageJson from "../package.json" with { type: "json" };
import printHelp from "./printHelp.js";

import resolvePositionals from "./engine/resolvePositionals.js";
import { execute, getCommandFromNode } from "./engine/core.js";
import render from "./terminal-ui/render.js";

const { positionals, values: flagValues } = parseArgs({
  args: process.argv.slice(2),
  options: {
    version: { type: "boolean", short: "v", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

const args = process.argv.slice(2);
const hasOnlyOneArg = args.length === 1;

// respond to --version
if (flagValues.version) {
  if (!hasOnlyOneArg) {
    console.error("error: --version must be used by itself.");
    process.exit(1);
  }
  console.log(`@execmeadow/vgit ${packageJson.version}`);
  process.exit(0);
}

// respond to --help
if (flagValues.help) {
  const response = printHelp(positionals);
  if (response.error) {
    console.error(response.error.message);
    process.exit(1);
  }
  console.log(response.output);
  process.exit(0);
}

// CORE LOGIC
const {
  error: positionalsError,
  node,
  params,
} = resolvePositionals(positionals);
if (positionalsError) {
  console.error(positionalsError.message);
  process.exit(1);
}
const { error: commandError, command } = getCommandFromNode(node);
if (commandError) {
  console.error(commandError.message);
  process.exit(1);
}
const { error: executionError, outputs } = await execute(command, params);
if (executionError) {
  console.error(executionError.message);
  process.exit(1);
}
render(outputs);
process.exit(0);
