// Define engine types.
type GitCommandTree = {
  type: "group" | "domain" | "root";
  description: string;
  [seg: string]: GitCommandTree | GitCommand<GitCommandId> | string | undefined;
};
type GitCommand<Id extends GitCommandId> = {
  type: "command";
  id: Id;
  description: string;
  usage: string;
  io: IOValidation[Id];
  execute(
    commandInput: InputOutputContracts[Id]["input"],
    context: EnvironmentContext,
  ): Promise<
    | { data: InputOutputContracts[Id]["output"]; error?: never }
    | { error: Error; data?: never }
  >;
};
type GitCommandId = keyof InputOutputContracts;
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
  "tag-list": {
    input: { [k in string]: never };
    output: { tagList: string[] };
  };
};
type IOValidation = {
  [Id in GitCommandId]: {
    input: {
      [K in keyof InputOutputContracts[Id]["input"]]: {
        isRequired: boolean;
        isValid: (arg: InputOutputContracts[Id]["input"][K]) => boolean;
      };
    };
    output: {
      [K in keyof InputOutputContracts[Id]["output"]]: {
        isRequired: boolean;
        isValid: (arg: InputOutputContracts[Id]["output"][K]) => boolean;
      };
    };
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
  | { type: "text"; style?: string; value: string }
  | { type: "heading"; value: string }
  | { type: "list"; style: "indented" | "numbered"; values: string[] }
  | { type: "label-value"; label: string; value: string };

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
  IOValidation,
  Error,
};
