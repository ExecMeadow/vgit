import git from "isomorphic-git";
import fs from "node:fs";
import { GitCommandTree, Error } from "./types.js";

// context
const program = "vgit";
const domain = "branch";
const dir = process.cwd();

// Git Command Registry
const branch = {
  async list(): Promise<
    { error: Error; data?: never } | { data: unknown; error?: never }
  > {
    try {
      // Fetch branch list.
      const branchList = await git.listBranches({ fs, dir });
      // Fetch current branch.
      const currentBranch = await git.currentBranch({ fs, dir });
      // Return data.
      return {
        data: { branches: branchList, currentBranch },
      };
      // Catch error.
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  },
  async create() {
    try {
      return { data: {} };
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  },
  async delete() {
    try {
      return { data: {} };
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  },
};

// Git Command Tree
export default {
  type: "group",
  description: "Root of git command tree",
  branch: {
    type: "group",
    description: "Manage branches",
    list: {
      type: "command",
      description: "List git branches",
      usage: `${program} ${domain} list`,
      execute: branch.list,
    },
    create: {
      type: "command",
      description: "Create a branch",
      usage: `${program} ${domain} create`,
      execute: branch.create,
    },
    delete: {
      type: "command",
      description: "Delete a branch",
      usage: `${program} ${domain} delete`,
      execute: branch.delete,
    },
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
} as GitCommandTree;
