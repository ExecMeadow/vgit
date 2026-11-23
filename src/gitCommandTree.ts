import git from "isomorphic-git";
import {
  GitCommandInput,
  GitCommandOutput,
  GitCommandTree,
  EnvironmentContext as EnvContext,
  Error,
} from "./types.js";

// Git Command Registry
const branch = {
  async list(
    commandInput: GitCommandInput["branch-list"],
    context: EnvContext,
  ): Promise<
    | { data: GitCommandOutput["branch-list"]; error?: never }
    | { error: Error; data?: never }
  > {
    const { dir, fs } = context;
    try {
      // Fetch branch list.
      const branchList = await git.listBranches({ fs, dir });
      // Fetch current branch.
      const currentBranch = await git.currentBranch({ fs, dir });
      // Return data.
      return {
        data: { branchList: branchList, currentBranch: currentBranch ?? "" },
      };
      // Catch error.
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  },
  async create(
    commandInput: GitCommandInput["branch-create"],
    context: EnvContext,
  ): Promise<
    | { data: GitCommandOutput["branch-create"]; error?: never }
    | { error: Error; data?: never }
  > {
    const { dir, fs } = context;
    const { branchName } = commandInput;
    try {
      await git.branch({ fs, dir, ref: branchName ?? "" });
      return { data: { createdBranchName: branchName } };
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  },
  async delete(
    commandInput: GitCommandInput["branch-delete"],
    context: EnvContext,
  ): Promise<
    | { data: GitCommandOutput["branch-delete"]; error?: never }
    | { error: Error; data?: never }
  > {
    const { dir, fs } = context;
    const { branchName } = commandInput;
    try {
      // Retrieve commit hash that this branch is pointing to:
      const objectId = await git.resolveRef({
        fs,
        dir,
        ref: `refs/heads/${branchName}`,
      });
      await git.deleteBranch({ fs, dir, ref: branchName ?? "" });
      return {
        data: { deletedBranchName: branchName, oid: objectId.slice(0, 7) },
      };
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  },
};

const program = "vgit";
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
      usage: `${program} branch list`,
      execute: branch.list,
    },
    create: {
      type: "command",
      id: "branch-create",
      description: "Create a branch",
      usage: `${program} branch create <branch-name>`,
      execute: branch.create,
    },
    delete: {
      type: "command",
      id: "branch-delete",
      description: "Delete a branch",
      usage: `${program} branch delete <branch-name>`,
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
