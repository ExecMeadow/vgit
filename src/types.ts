type GitCommandTree = {
  type: "group";
  description: string;
  [seg: string]: GitCommandTree | GitCommand | string | undefined;
};
type GitCommand = {
  type: "command";
  description: string;
  usage: string;
  execute: (
    params: string[],
  ) => Promise<
    { data: unknown; error?: never } | { error: Error; data?: never }
  >;
};

type TerminalUITree = {
  [seg: string]: TerminalUITree | OutputCall<unknown> | undefined;
};
type OutputCall<TArgs> = (...args: TArgs[]) => Output[];
type Output =
  | { type: "text"; value: string }
  | { type: "indentedList" | "numberedList"; values: string[] };

type Error = {
  code: string;
  message: string;
};

export { GitCommandTree, GitCommand, Output, Error, TerminalUITree };
