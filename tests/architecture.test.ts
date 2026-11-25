import test from "node:test";
import assert from "node:assert/strict";

import { verify as engineVerify } from "../src/engine/validation.js";
import { verify as uiVerify } from "../src/terminal-ui/validation.js";
import resolveInputs from "../src/cli/resolveInputs.js";
import { inputOutputContracts } from "../src/gitCommandTree.js";
import terminalUIMap from "../src/terminal-ui/terminalUIMap.js";

test("Architecture(engine): reject duplicate command IDs across domains.", () => {
  const leaf = (id: string) => ({
    type: "command",
    id,
    description: "command description",
    usage: "vgit usage",
    io: { input: {}, output: {} },
    execute: async () => ({ data: {} }),
  });
  const tree = {
    type: "root",
    description: "root description",
    branch: {
      type: "domain",
      description: "domain description",
      list: leaf("duplicate-command-id"),
    },
    tag: {
      type: "domain",
      description: "tags",
      list: leaf("duplicate-command-id"),
    },
  };

  assert.equal(engineVerify.isValidCommandTree(tree).error?.code, "INVALID_ID");
});

test("Architecture(engine): map CLI positionals using the command input contract.", () => {
  const result = resolveInputs(inputOutputContracts["branch-create"].input, [
    "feature/accessibility",
  ]);

  assert.deepEqual(result, {
    userInput: { branchName: "feature/accessibility" },
  });
});

test("Architecture(UI): accept every semantic terminal-output variant.", () => {
  const result = uiVerify.areValidTerminalOutputs([
    { type: "heading", value: "Branches" },
    { type: "label-value", label: "Usage", value: "vgit branch list" },
    { type: "list", style: "indented", values: ["main"] },
    { type: "text", value: "Done." },
  ]);
  assert.deepEqual(result, {});
});

test("Architecture(UI): branch-list presentation is semantic and identifies the current branch.", () => {
  const output = terminalUIMap["branch-list"].present({
    branchList: ["main", "feature/accessibility"],
    currentBranch: "main",
  });

  assert.deepEqual(output, [
    { type: "heading", value: "Branches:" },
    { type: "text", value: "2 branches found." },
    {
      type: "list",
      style: "indented",
      values: ["main (current branch)", "feature/accessibility"],
    },
  ]);
});
