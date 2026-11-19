type Segment =
  | {
      leaf?: never;
      [seg: string]: Segment | Leaf | undefined;
    }
  | { leaf: Leaf; [seg: string]: Segment | Leaf | undefined };

type Leaf = {
  execute: (params: string[]) => Promise<{ outputs: CommandOutput[] }>;
  description: string;
  usage: string;
};

type CommandOutput =
  | { type: "text"; value: string }
  | { type: "indentedList" | "numberedList"; values: string[] };

type Error = {
  code: string;
  message: string;
};

export { Segment, Leaf, CommandOutput, Error };
