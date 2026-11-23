import {
  TerminalUIMap,
  TerminalOutput,
  GitCommandOutput,
  GitCommandId,
  Error,
} from "../types.js";

// given: git-command-id and command output data
// return: terminal ui or a missing data error
export function getTerminalUI<Id extends GitCommandId>(
  id: Id,
  commandOutput: GitCommandOutput[Id],
): { error: Error; ui?: never } | { ui: TerminalOutput[]; error?: never } {
  const { error: dataError } = getDataStatus(
    terminalUIMap[id].expectedCommandOutputs,
    commandOutput,
  );
  if (dataError) {
    return { error: dataError };
  } else {
    return { ui: terminalUIMap[id].present(commandOutput) };
  }
}
function getDataStatus(
  expecting: string[],
  commandOutput: GitCommandOutput[GitCommandId],
): { error?: Error } {
  const missingValues: string[] = [];
  const noMissingData = expecting.every((element) => {
    if (element in commandOutput) {
      return true;
    } else {
      missingValues.push(element);
      return false;
    }
  });
  if (noMissingData) {
    return {};
  } else {
    return {
      error: {
        code: "MISSING_DATA",
        message: `Missing data values: ${missingValues}`,
      },
    };
  }
}
// UI Map: command-id maps to terminal UI.
const terminalUIMap: TerminalUIMap = {
  "branch-list": {
    expectedCommandOutputs: ["branchList"],
    present: (commandOutput: GitCommandOutput["branch-list"]) => {
      const { branchList, currentBranch } = commandOutput;
      const index = branchList.indexOf(currentBranch);
      branchList[index] = `${currentBranch} (current branch)`;
      return [
        { type: "text", value: "Branches:" },
        {
          type: "text",
          value: `${branchList.length} branch${branchList.length === 1 ? "" : "es"} found.`,
        },
        { type: "indentedList", values: branchList },
      ];
    },
  },
  "branch-create": {
    expectedCommandOutputs: ["createdBranchName"],
    present: (commandOutput: GitCommandOutput["branch-create"]) => {
      const { createdBranchName } = commandOutput;
      return [
        { type: "text", value: `Created branch '${createdBranchName}'.` },
      ];
    },
  },
  "branch-delete": {
    expectedCommandOutputs: ["deletedBranchName"],
    present: (commandOutput: GitCommandOutput["branch-delete"]) => {
      const { deletedBranchName, oid } = commandOutput;
      return [
        {
          type: "text",
          value: `Deleted branch '${deletedBranchName}' (was ${oid}).`,
        },
      ];
    },
  },
};
