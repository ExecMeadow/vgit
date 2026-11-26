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
          value: `${displayedBranchList.length} branch${isPlural(displayedBranchList) ? "es" : ""} found.`,
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
          value: `${tagList.length} tag${isPlural(tagList) ? "s" : ""} found.`,
        },
        { type: "list", style: "indented", values: tagList },
      ];
    },
  },
  status: {
    present: (commandOutput: IO["status"]["output"]) => {
      const { headStatus, upToDateStatus, workingTreeStatus } = commandOutput;
      const outputs: TerminalOutput[] = [];
      if (headStatus.detached) {
        outputs.push({
          type: "text",
          value: `You are detached, on commit ${headStatus.oid}.`,
        });
      } else {
        outputs.push({
          type: "text",
          value: `You are on branch '${headStatus.branchName}'.`,
        });
      }
      if (upToDateStatus) {
        outputs.push({
          type: "text",
          value: `Branch '${headStatus.branchName}' is up to date with '${upToDateStatus.remote}'`,
        });
      }

      outputs.push({ type: "text", value: "" });
      const { untracked, staged, unstaged } = workingTreeStatus;
      if (staged.length > 0) {
        outputs.push({
          type: "text",
          value: `${staged.length} staged file${isPlural(staged) ? "s" : ""}.`,
        });
        const stagedList: string[] = [];
        for (const [file, fileStatus] of staged) {
          stagedList.push(`${fileStatus}: ${file}`);
        }
        outputs.push({ type: "list", style: "indented", values: stagedList });
      }
      if (unstaged.length > 0) {
        outputs.push({
          type: "text",
          value: `${unstaged.length} unstaged file${isPlural(unstaged) ? "s" : ""}.`,
        });
        const unstagedList: string[] = [];
        for (const [file, fileStatus] of unstaged) {
          unstagedList.push(`${fileStatus}: ${file}`);
        }
        outputs.push({ type: "list", style: "indented", values: unstagedList });
      }
      if (untracked.length > 0) {
        outputs.push({
          type: "text",
          value: `${untracked.length} untracked file${isPlural(untracked) ? "s" : ""}.`,
        });
        outputs.push({ type: "list", style: "indented", values: untracked });
      }
      return outputs;
    },
  },
};

function isPlural(array: Array<unknown>) {
  return array.length !== 1;
}

export default terminalUIMap;
