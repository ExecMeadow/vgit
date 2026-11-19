type Segment =
  | {
      [seg: string]: Segment | Command | undefined;
    }
  | { command: Command; [seg: string]: Segment | Command | undefined };

type Command = {
  execute: (params: string[]) => Promise<Result>;
  description: string;
  usage: string;
};

type Output =
  | { type: "text"; value: string }
  | { type: "indentedList" | "numberedList"; values: string[] };

type Result = {
  command: string;
  outputs: Output[];
};

export { Segment, Command, Output };
