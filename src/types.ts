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
    params: string[],
  ) => Promise<
    { data: Data; error?: never } | { error: Error; data?: never }
  >;
};
type GitCommandId = "branch-list" | "branch-create" | "branch-delete";

type TerminalUIMap = Record<GitCommandId, (args: Data) => Output[]>
type Data = {
	[seg: string]: string | string[] | undefined;
}
type Output =
  | { type: "text"; value: string }
  | { type: "indentedList" | "numberedList"; values: string[] };

type Error = {
  code: string;
  message: string;
};

export { Data, GitCommandTree, GitCommand, GitCommandId, Output, Error, TerminalUIMap };
