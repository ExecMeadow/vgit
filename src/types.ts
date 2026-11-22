// Define engine types.
type GitCommandTree = {
  type: "group";
  description: string;
  [seg: string]: GitCommandTree | GitCommand | string | undefined;
};
type GitCommand = {
  type: "command";
  id: GitCommandId;
  description: string;
  usage: string;
  execute: (
    arg0: Data,
    arg1: EnvironmentContext,
  ) => Promise<{ data: Data; error?: never } | { error: Error; data?: never }>;
};
type GitCommandId = "branch-list" | "branch-create" | "branch-delete";
type EnvironmentContext = {
  program: string;
  dir: string;
  fs: typeof import("node:fs");
};

// Define terminal UI types.
type TerminalUIMap = Record<GitCommandId, (args: Data) => Output[]>;
type Data = {
  branchList?: string[];
  currentBranch?: string;
  branchName?: string;
  [seg: string]: string | string[] | undefined;
};
type Output =
  | { type: "text"; value: string }
  | { type: "indentedList" | "numberedList"; values: string[] };

// Define Generic error.
type Error = {
  code: string;
  message: string;
};

export {
  Data,
  GitCommandTree,
  GitCommand,
  GitCommandId,
  Output,
  Error,
  TerminalUIMap,
  EnvironmentContext,
};
