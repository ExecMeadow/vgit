type CommandTree = {
  leaf?: Leaf;
  [seg: string]: CommandTree | Leaf | undefined;
};

type Leaf = {
  leaf?: undefined;
  execute: (params: string[]) => Promise<{ outputs: Output[] }>;
  description: string;
  usage: string;
};

type Output =
  | { type: "text"; value: string }
  | { type: "indentedList" | "numberedList"; values: string[] };

type Error = {
  code: string;
  message: string;
};

export { CommandTree, Leaf, Output, Error };
