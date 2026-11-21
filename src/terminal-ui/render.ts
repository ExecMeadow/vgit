import format from "./format.js";
import { Output, GitCommandId, Data } from "../types.js";
import {getTerminalUI} from "./terminalUIMap.js";

export default function renderGitData(id: GitCommandId, data: Data) {
  const { error: outputError, ui: outputs } = getTerminalUI(id, data);
  if (outputError) {
    return outputError;
  }
  renderOutputs(outputs);
}

export function renderAvailableGitCommands(commandList: string[]) {
  const output: Output[] = [];
  output.push({ type: "text", value: "Available git commands: " });
  output.push({
    type: "text",
    value: `${commandList.length} command${commandList.length === 1 ? "" : "s"} found.`,
  });
  const commandsOutput: Output = {
    type: "indentedList",
    values: commandList,
  };
  renderOutputs([...output, commandsOutput]);
}

export function renderCommandUsage(usage: string) {
  const commandUsage: Output[] = [
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
  const programUsage: Output[] = [
    { type: "text", value: "Usage: vgit <domain> <action> [--help]" },
    { type: "text", value: "" },
  ];
  renderOutputs(programUsage);
}

// Render Tool.
export function renderOutputs(outputs: Output[]) {
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
