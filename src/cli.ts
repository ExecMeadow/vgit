#!/usr/bin/env node

import { parseArgs } from "node:util";
import packageJson from "../package.json" with { type: "json" };
import printHelp from "./printHelp.js";

import core from "./engine/core.js";

const { values: flagValues } = parseArgs({
  args: process.argv.slice(2),
  options: {
    version: { type: "boolean", short: "v", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

const args = process.argv.slice(2);
const hasOnlyOneArg = args.length === 1;

// respond to --help
if (flagValues.help) {
  if (!hasOnlyOneArg) {
    console.error("error: --help must be used by itself.");
    process.exit(1);
  }
  printHelp();
  process.exit(0);
}

// respond to --version
if (flagValues.version) {
  if (!hasOnlyOneArg) {
    console.error("error: --version must be used by itself.");
    process.exit(1);
  }
  console.log(`@execmeadow/vgit ${packageJson.version}`);
  process.exit(0);
}

core(args);
