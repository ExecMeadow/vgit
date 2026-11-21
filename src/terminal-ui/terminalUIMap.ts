import { Output, Data, Error, GitCommandId, TerminalUIMap } from "../types.js";

// given: git-command-id and data
// return: terminal ui or a missing data error
export function getTerminalUI(
  id: GitCommandId,
  data: Data,
): { error: Error; ui?: never } | { ui: Output[]; error?: never } {
  const { error: dataError } = getDataStatus(expectedData[id], data);
  if (dataError) {
    return { error: dataError };
  }
  return { ui: terminalUIMap[id](data) };
}
function getDataStatus(expecting: string[], data: Data): { error?: Error } {
  const missingValues: string[] = [];
  const noMissingData = expecting.every((element) => {
    if (element in data) {
      return true;
    } else {
      missingValues.push(element);
      return false;
    }
  });
  if (noMissingData) {
    return {};
  }
  return {
    error: {
      code: "MISSING_DATA",
      message: `Missing data values: ${missingValues}`,
    },
  };
}

// UI Map
const terminalUIMap = {
  "branch-list"(data: { branchList?: string[] }) {
    const { branchList = [] } = data;
    return [
      { type: "text", value: "Branches:" },
      {
        type: "text",
        value: `${branchList.length} branch${branchList.length === 1 ? "" : "es"} found.`,
      },
      { type: "indentedList", values: branchList },
    ];
  },
  "branch-create"(data: { branchName?: string }) {
    const { branchName = ""} = data;
    return [{ type: "text", value: `Created branch '${branchName}'.` }];
  },
  "branch-delete"(data: { branchName?: string, oid?: string }) {
    const { branchName = "", oid = "" } = data;
    return [{ type: "text", value: `Deleted branch '${branchName}' (was ${oid}).` }];
  },
} satisfies TerminalUIMap;

// Expected data for each git-command
const expectedData = {
  "branch-list": ["branchList"],
  "branch-create": ["branchName"],
  "branch-delete": ["branchName"],
} satisfies Record<GitCommandId, string[]>;
