import format from "./format.js";
import { TerminalOutput, GitCommandId, GitCommandOutput } from "../types.js";
import { getTerminalUI } from "./terminalUIMap.js";

export default function renderGitData<Id extends GitCommandId>(
  id: Id,
  commandOutput: GitCommandOutput[Id],
) {
  const { error: outputError, ui: outputs } = getTerminalUI(id, commandOutput);
  if (outputError) {
    return outputError;
  }
  renderOutputs(outputs);
}

export function renderAvailableGitCommands(commandList: string[]) {
  const output: TerminalOutput[] = [];
  output.push({ type: "text", value: "Available git commands: " });
  output.push({
    type: "text",
    value: `${commandList.length} command${commandList.length === 1 ? "" : "s"} found.`,
  });
  const commandsOutput: TerminalOutput = {
    type: "indentedList",
    values: commandList,
  };
  renderOutputs([...output, commandsOutput]);
}

export function renderCommandUsage(usage: string) {
  const commandUsage: TerminalOutput[] = [
    {
      type: "text",
      value: `Usage: ${usage}\n`,
    },
  ];
  renderOutputs(commandUsage);
}

export function renderDescription(description: string) {
  renderOutputs([
    { type: "text", value: `Description: ${description}` },
    { type: "text", value: "" },
  ]);
}

export function renderProgramUsage() {
  const programUsage: TerminalOutput[] = [
    { type: "text", value: "Usage: vgit <domain> <action> [--help]" },
    { type: "text", value: "" },
  ];
  renderOutputs(programUsage);
}

// Render Tool.
export function renderOutputs(outputs: TerminalOutput[]) {
  for (const element of outputs) {
    if (element.type === "text") {
      print[element.type](element.value);
    } else {
      print[element.type](element.values);
    }
  }
}

// Render Tool.
const print = {
  text(message: string) {
    console.log(message);
  },
  numberedList(items: string[]) {
    console.log(format.numberedList(items, 1));
  },
  indentedList(items: string[]) {
    console.log(format.indentedList(items, 1));
  },
  table() {},
};
