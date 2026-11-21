import git from "isomorphic-git";
import fs from "node:fs";
import { Data, GitCommandTree, Error } from "./types.js";

// context
const getProgram = () => "vgit";
const getDomain = () => "branch";
const getDir = () => process.cwd();

// Git Command Registry
const branch = {
  async list(): Promise<
    { error: Error; data?: never } | { data: Data; error?: never }
  > {
    try {
      // Fetch branch list.
      const branchList = await git.listBranches({ fs, dir: getDir() });
      // Fetch current branch.
      const currentBranch = await git.currentBranch({ fs, dir: getDir() });
      // Return data.
      return {
        data: { branchList: branchList, currentBranch: currentBranch ?? "" },
      };
      // Catch error.
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  },
  async create(params: string[]) {
    const branchName = params[0];
    try {
      await git.branch({ fs, dir: getDir(), ref: branchName });
      return { data: { branchName } };
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  },
  async delete(params: string[]) {
    const branchName = params[0];
    try {
      // Retrieve commit hash that this branch is pointing to:
      const objectId = await git.resolveRef({
        fs,
        dir: getDir(),
        ref: `refs/heads/${branchName}`,
      });
      await git.deleteBranch({ fs, dir: getDir(), ref: branchName });
      return { data: { branchName, oid: objectId.slice(0, 7) } };
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
      id: "branch-list",
      description: "List git branches",
      usage: `${getProgram()} ${getDomain()} list`,
      execute: branch.list,
    },
    create: {
      type: "command",
      id: "branch-create",
      description: "Create a branch",
      usage: `${getProgram()} ${getDomain()} create`,
      execute: branch.create,
    },
    delete: {
      type: "command",
      id: "branch-delete",
      description: "Delete a branch",
      usage: `${getProgram()} ${getDomain()} delete`,
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
} satisfies GitCommandTree;
