#!/usr/bin/env node

import { parseArgs } from "node:util";
import packageJson from "../package.json" with { type: "json" };

import { Error } from "./types.js";
import respondToHelp from "./cli/respondToHelp.js";
import resolveInputs from "./cli/resolveInputs.js";
import resolvePositionals from "./engine/resolvePositionals.js";
import execute from "./engine/execute.js";
import renderGitData, {
  renderDomain,
  renderDescription,
  renderAvailableCommands,
  renderNewLine,
} from "./terminal-ui/render.js";
import discoverCommands from "./engine/discoverCommands.js";
import fs from "node:fs";

import { verify as engineVerify } from "./engine/validation.js";
import { verify as uiVerify } from "./terminal-ui/validation.js";
import gitCommandTree, { inputOutputContracts } from "./gitCommandTree.js";
import terminalUIMap from "./terminal-ui/terminalUIMap.js";

// Validate git command tree.
const { error: treeError } = engineVerify.isValidCommandTree(gitCommandTree);
if (treeError) {
  console.error("Error: invalid git command tree. " + treeError.message);
  process.exit(1);
}
// validate terminal UI map.
const { error: uiError } = uiVerify.isValidTerminalUIMap(
  terminalUIMap,
  inputOutputContracts,
);
if (uiError) {
  console.error("Error: invalid terminal UI map. " + uiError.message);
  process.exit(1);
}

// Start CLI.
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
function respondToHelpError(error?: Error) {
  if (error) {
    console.error("Error: " + error.message);
    process.exit(1);
  }
}
if (flagValues.help || positionals.length === 0) {
  const { error: helpError } = respondToHelp(positionals);
  respondToHelpError(helpError);
  process.exit(0);
} else if (positionals[0] === "help") {
  const { error: helpError } = respondToHelp(positionals.slice(1));
  respondToHelpError(helpError);
  process.exit(0);
} else if (positionals[positionals.length - 1] === "help") {
  const { error: helpError } = respondToHelp(
    positionals.slice(0, positionals.length - 1),
  );
  respondToHelpError(helpError);
  process.exit(0);
}

// CORE LOGIC
const context = { dir: process.cwd(), fs };
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
    case "domain":
    case "group": {
      // Handle incomplete command.
      const commands = discoverCommands(node, [positionals.join(" ")]);
      renderDomain(positionals[0]);
      renderDescription(node.description);
      renderNewLine();
      renderAvailableCommands(commands);
      process.exit(1);
      break;
    }
    case "command": {
      const { error: inputError, userInput } = resolveInputs(
        node.io.input,
        params,
      );
      if (inputError) {
        console.error("Error: " + inputError.message);
        process.exit(1);
      }
      // Execute command.
      const {
        error: executionError,
        data,
        commandId,
      } = await execute(node, userInput, context);
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
