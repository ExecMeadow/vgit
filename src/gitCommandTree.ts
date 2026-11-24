import git from "isomorphic-git";
import {
  InputOutputContracts as IO,
  IOValidation,
  GitCommandTree,
  GitCommand,
  EnvironmentContext as EnvContext,
} from "./types.js";
import { utils } from "./engine/validation.js";

/* Git Command Registry */
// Branch
const branch = {
  list: (async (commandInput, context) => {
    const { dir, fs } = context;
    try {
      // Fetch branch list.
      const branchList = await git.listBranches({ fs, dir });
      // Fetch current branch.
      const currentBranch = await git.currentBranch({ fs, dir });
      // Return data.
      return {
        data: {
          branchList,
          currentBranch: currentBranch ?? undefined,
        },
      };
      // Catch error.
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  }) satisfies GitCommand<"branch-list">["execute"],
  create: (async (commandInput, context) => {
    const { dir, fs } = context;
    const { branchName } = commandInput;
    try {
      await git.branch({ fs, dir, ref: branchName ?? "" });
      return { data: { createdBranchName: branchName } };
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  }) satisfies GitCommand<"branch-create">["execute"],
  delete: (async (
    commandInput: IO["branch-delete"]["input"],
    context: EnvContext,
  ) => {
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
  }) satisfies GitCommand<"branch-delete">["execute"],
};

// Tag
const tag = {
  list: (async (commandInput, context) => {
    const { dir, fs } = context;
    try {
      // Fetch tag list.
      const tagList = await git.listTags({ fs, dir });
      // Return data.
      return {
        data: {
          tagList,
        },
      };
      // Catch error.
    } catch (err: unknown) {
      return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
    }
  }) satisfies GitCommand<"tag-list">["execute"],
};

/* IO Contracts */
const inputOutputContracts: IOValidation = {
  "branch-list": {
    input: {},
    output: {
      branchList: { isRequired: true, isValid: utils.isStringArray },
      currentBranch: { isRequired: false, isValid: utils.isString },
    },
  },
  "branch-create": {
    input: { branchName: { isRequired: true, isValid: utils.isString } },
    output: {
      createdBranchName: { isRequired: true, isValid: utils.isString },
    },
  },
  "branch-delete": {
    input: { branchName: { isRequired: true, isValid: utils.isString } },
    output: {
      deletedBranchName: { isRequired: true, isValid: utils.isString },
      oid: { isRequired: true, isValid: utils.isString },
    },
  },
  "tag-list": {
    input: {},
    output: {
      tagList: { isRequired: true, isValid: utils.isString },
    },
  },
};

const program = "vgit";
/* Git Command Tree */
const gitCommandTree: GitCommandTree = {
  type: "group",
  description: "Root of git command tree",
  branch: {
    type: "domain",
    description: "Manage branches",
    list: {
      type: "command",
      id: "branch-list",
      description: "List git branches",
      usage: `${program} branch list`,
      io: inputOutputContracts["branch-list"],
      execute: branch.list,
    },
    create: {
      type: "command",
      id: "branch-create",
      description: "Create a branch",
      usage: `${program} branch create <branch-name>`,
      io: inputOutputContracts["branch-create"],
      execute: branch.create,
    },
    delete: {
      type: "command",
      id: "branch-delete",
      description: "Delete a branch",
      usage: `${program} branch delete <branch-name>`,
      io: inputOutputContracts["branch-delete"],
      execute: branch.delete,
    },
    //switch: { leaf },
    //    rename: { leaf },
    //    merge: { leaf },
    //    track: { leaf },
  },
  tag: {
    type: "domain",
    description: "Manage tags",
    list: {
      type: "command",
      id: "tag-list",
      description: "List git tags",
      usage: `${program} tag list`,
      io: inputOutputContracts["tag-list"],
      execute: tag.list,
    },
    //  create: { annotated: {}, lightweight: {} },
    //  delete: {},
    //  show: {},
  },
  /*
  stash: {
    list: {},
    create: {},
    delete: {},
    apply: {},
  },
 */
};
export default gitCommandTree;
