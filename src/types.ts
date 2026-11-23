// Define engine types.
type GitCommandTree = {
  type: "group";
  description: string;
  [seg: string]: GitCommandTree | GitCommand<GitCommandId> | string | undefined;
};
type GitCommand<Id extends GitCommandId> = {
  type: "command";
  id: Id;
  description: string;
  usage: string;
  execute(
    commandInput: GitCommandInput[Id],
    context: EnvironmentContext,
  ): Promise<
    | { data: GitCommandOutput[Id]; error?: never }
    | { error: Error; data?: never }
  >;
};
type GitCommandId = "branch-list" | "branch-create" | "branch-delete";
type GitCommandInput = {
  "branch-list": { [k in string]: never };
  "branch-create": { branchName: string };
  "branch-delete": { branchName: string };
};
type GitCommandOutput = {
  "branch-list": { branchList: string[]; currentBranch: string };
  "branch-create": { createdBranchName: string };
  "branch-delete": { deletedBranchName: string; oid: string };
};
type EnvironmentContext = {
  dir: string;
  fs: typeof import("node:fs");
};

// Define terminal UI types.
type TerminalUIMap = {
  [Id in GitCommandId]: {
    expectedCommandOutputs: string[];
    present: (commandOutput: GitCommandOutput[Id]) => TerminalOutput[];
  };
};
type TerminalOutput =
  | { type: "text"; value: string }
  | { type: "indentedList" | "numberedList"; values: string[] };

// Define Generic error.
type Error = {
  code: string;
  message: string;
};

export {
  GitCommandTree,
  GitCommand,
  GitCommandId,
  GitCommandInput,
  GitCommandOutput,
  TerminalUIMap,
  TerminalOutput,
  EnvironmentContext,
  Error,
};
