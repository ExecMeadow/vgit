import { CommandTree } from "./types.js";
import branch from "./commands/branch.js";

export default {
  branch: {
    list: { leaf: branch.list },
    create: { leaf: branch.create },
    delete: { leaf: branch.delete },
    //switch: { leaf },
    //    rename: { leaf },
    //    merge: { leaf },
    //    track: { leaf },
  },
  /*  stash: {
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
 */
} as CommandTree;
