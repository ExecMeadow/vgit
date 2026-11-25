import format from "./format.js";
import {
  TerminalOutput,
  GitCommandId,
  InputOutputContracts as IO,
} from "../types.js";
import { getTerminalUI } from "./terminalUIMap.js";

export default function renderGitData<Id extends GitCommandId>(
  id: Id,
  commandOutput: IO[Id]["output"],
) {
  const { error: outputError, ui: outputs } = getTerminalUI(id, commandOutput);
  if (outputError) {
    return outputError;
  }
  renderOutputs(outputs);
}

export function renderAvailableDomains(domainList: string[]) {
  const output: TerminalOutput[] = [];
  output.push({ type: "heading", value: "Available Domains:" });
  output.push({
    type: "text",
    value: `${domainList.length} domain${domainList.length === 1 ? "" : "s"} found.`,
  });
  const domainOutput: TerminalOutput = {
    type: "list",
    style: "indented",
    values: domainList,
  };
  renderOutputs([...output, domainOutput]);
}

export function renderAvailableCommands(commandList: string[]) {
  const output: TerminalOutput[] = [];
  output.push({ type: "heading", value: "Available Commands:" });
  output.push({
    type: "text",
    value: `${commandList.length} command${commandList.length === 1 ? "" : "s"} found.`,
  });
  const commandsOutput: TerminalOutput = {
    type: "list",
    style: "indented",
    values: commandList,
  };
  renderOutputs([...output, commandsOutput]);
}

export function renderCommandUsage(usage: string) {
  const commandUsage: TerminalOutput[] = [
    {
      type: "label-value",
      label: "Usage",
      value: usage,
    },
  ];
  renderOutputs(commandUsage);
}

export function renderNewLine() {
  renderOutputs([{ type: "text", value: "" }]);
}

export function renderDomain(domain: string) {
  renderOutputs([{ type: "label-value", label: "Domain", value: domain }]);
}

export function renderDescription(description: string) {
  renderOutputs([
    { type: "label-value", label: "Description", value: description },
  ]);
}

export function renderProgramUsage() {
  renderOutputs([
    {
      type: "label-value",
      label: "Usage",
      value: "vgit <domain> [action] [--help]",
    },
  ]);
}

// Render Tool.
export function renderOutputs(outputs: TerminalOutput[]) {
  for (const element of outputs) {
    if (element.type === "text" && element.style === "indented") {
      print.indentedText(element.value);
    } else if (element.type === "heading" || element.type === "text") {
      print.text(element.value);
    } else if (element.type === "list") {
      switch (element.style) {
        case "numbered": {
          print.numberedList(element.values);
          break;
        }
        case "indented": {
          print.indentedList(element.values);
          break;
        }
      }
    } else if (element.type === "label-value") {
      print.labelValue(element.label, element.value);
    }
  }
}

// Render Tool.
const print = {
  text(message: string) {
    console.log(message);
  },
  indentedText(message: string) {
    console.log(" " + message);
  },
  numberedList(items: string[]) {
    console.log(format.numberedList(items, 1));
  },
  indentedList(items: string[]) {
    console.log(format.indentedList(items, 1));
  },
  labelValue(label: string, value: string) {
    console.log(label + ": " + value);
  },
  table() {},
};
