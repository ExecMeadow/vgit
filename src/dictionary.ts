import { Segment, Command } from "./types.js";
import branch from "./commands/branch.js";

const command: Command = { description: "", usage: "", execute() {} };

export default {
  branch: {
    list: { command: branch.list },
    create: { command: branch.create },
    delete: { command: branch.delete },
    switch: { command },
    rename: { command },
    merge: { command },
    track: { command },
  },
  stash: {
    list: {},
    create: {},
    delete: {},
    apply: {},
  },
  tag: {
    list: {},
    create: { annotated: {}, lightweight: {} },
    delete: {},
    show: {},
  },
} as Segment;
