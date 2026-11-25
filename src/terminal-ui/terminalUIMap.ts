import {
  TerminalUIMap,
  TerminalOutput,
  InputOutputContracts as IO,
  GitCommandId,
  Error,
} from "../types.js";

// Function: get terminal UI.
// given: git-command-id and command output data
// return: terminal ui or a missing data error
export function getTerminalUI<Id extends GitCommandId>(
  id: Id,
  commandOutput: IO[Id]["output"],
): { error: Error; ui?: never } | { ui: TerminalOutput[]; error?: never } {
  return { ui: terminalUIMap[id].present(commandOutput) };
}

// UI Map: command-id maps to terminal UI.
const terminalUIMap: TerminalUIMap = {
  "branch-list": {
    present: (commandOutput: IO["branch-list"]["output"]) => {
      const { branchList, currentBranch } = commandOutput;
      const displayedBranchList = branchList.map((branch) =>
        currentBranch === branch ? `${branch} (current branch)` : branch,
      );
      return [
        { type: "heading", value: "Branches:" },
        {
          type: "text",
          value: `${displayedBranchList.length} branch${displayedBranchList.length === 1 ? "" : "es"} found.`,
        },
        { type: "list", style: "indented", values: displayedBranchList },
      ];
    },
  },
  "branch-create": {
    present: (commandOutput: IO["branch-create"]["output"]) => {
      const { createdBranchName } = commandOutput;
      return [
        { type: "text", value: `Created branch '${createdBranchName}'.` },
      ];
    },
  },
  "branch-delete": {
    present: (commandOutput: IO["branch-delete"]["output"]) => {
      const { deletedBranchName, oid } = commandOutput;
      return [
        {
          type: "text",
          value: `Deleted branch '${deletedBranchName}' (was ${oid}).`,
        },
      ];
    },
  },
  "tag-list": {
    present: (commandOutput: IO["tag-list"]["output"]) => {
      const { tagList } = commandOutput;
      return [
        { type: "heading", value: "Tags:" },
        {
          type: "text",
          value: `${tagList.length} tag${tagList.length === 1 ? "" : "s"} found.`,
        },
        { type: "list", style: "indented", values: tagList },
      ];
    },
  },
};
export default terminalUIMap;
