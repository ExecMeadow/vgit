// Define engine types.
type GitCommandTree = {
  type: "group" | "domain";
  description: string;
  [seg: string]: GitCommandTree | GitCommand<GitCommandId> | string | undefined;
};
type GitCommand<Id extends GitCommandId> = {
  type: "command";
  id: Id;
  description: string;
  usage: string;
  execute(
    commandInput: InputOutputContracts[Id]["input"],
    context: EnvironmentContext,
  ): Promise<
    | { data: InputOutputContracts[Id]["output"]; error?: never }
    | { error: Error; data?: never }
  >;
};
type GitCommandId = "branch-list" | "branch-create" | "branch-delete";
type InputOutputContracts = {
  "branch-list": {
    input: { [k in string]: never };
    output: { branchList: string[]; currentBranch?: string };
  };
  "branch-create": {
    input: { branchName: string };
    output: { createdBranchName: string };
  };
  "branch-delete": {
    input: { branchName: string };
    output: { deletedBranchName: string; oid: string };
  };
};
type EnvironmentContext = {
  dir: string;
  fs: typeof import("node:fs");
};

// Define terminal UI types.
type TerminalUIMap = {
  [Id in GitCommandId]: {
    present: (
      commandOutput: InputOutputContracts[Id]["output"],
    ) => TerminalOutput[];
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
  TerminalUIMap,
  TerminalOutput,
  EnvironmentContext,
  InputOutputContracts,
  Error,
};
