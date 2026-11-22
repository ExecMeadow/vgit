#!/usr/bin/env node

import { parseArgs } from "node:util";
import packageJson from "../package.json" with { type: "json" };

import resolvePositionals from "./engine/resolvePositionals.js";
import execute from "./engine/execute.js";
import resolveInputs from "./engine/resolveInputs.js";
import renderGitData, {
  renderProgramUsage,
  renderCommandUsage,
  renderDescription,
  renderAvailableGitCommands,
} from "./terminal-ui/render.js";
import discoverCommands from "./engine/discoverCommands.js";
import fs from "node:fs";

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

// respond to --help and help
function respondToHelp(positionals: string[]) {
  const { error: positionalsError, node } = resolvePositionals(positionals);
  if (positionalsError) {
    console.error("Error: " + positionalsError.message);
    process.exit(1);
  }
  switch (node.type) {
    case "command": {
      renderCommandUsage(node.usage);
      renderDescription(node.description);
      break;
    }
    case "group": {
      if (positionals.length === 0) {
        renderProgramUsage();
      }
      const commands = discoverCommands(node);
      renderAvailableGitCommands(commands);
    }
  }
  process.exit(0);
}
if (flagValues.help || positionals.length === 0) {
  respondToHelp(positionals);
} else if (positionals[0] === "help") {
  respondToHelp(positionals.slice(1));
} else if (positionals[positionals.length - 1] === "help") {
  respondToHelp(positionals.slice(0, positionals.length - 1));
}

// CORE LOGIC
const context = { program: "vgit", dir: process.cwd(), fs };
const {
  error: positionalsError,
  node,
  params,
} = resolvePositionals(positionals);
if (positionalsError) {
  console.error("Error: " + positionalsError.message);
  process.exit(1);
} else {
  switch (node.type) {
    case "group": {
      // Handle incomplete command.
      const commands = discoverCommands(node, [positionals.join(" ")]);
      renderDescription(node.description);
      renderAvailableGitCommands(commands);
      process.exit(1);
      break;
    }
    case "command": {
      const { error: inputError, inputs } = resolveInputs(node.id, params);
      if (inputError) {
        console.error("Error: " + inputError.message);
        process.exit(1);
      }
      // Execute command.
      const {
        error: executionError,
        data,
        commandId,
      } = await execute(node, inputs, context);
      if (executionError) {
        console.error("Error: " + executionError.message);
        process.exit(1);
      }
      // Render command data.
      const renderError = renderGitData(commandId, data);
      if (renderError) {
        console.error("Error: " + renderError.message);
        process.exit(1);
      }
      process.exit(0);
    }
  }
}
// Handle unexpected errors.
console.error("Unexpected error.");
process.exit(1);
