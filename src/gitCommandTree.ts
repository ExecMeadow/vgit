import git from "isomorphic-git";
import {
  InputOutputContracts as IO,
  IOValidation,
  GitCommandTree,
  GitCommand,
  EnvironmentContext as EnvContext,
} from "./types.js";
import { utils } from "./validation.js";
import resolveMatrix from "./engine/resolveMatrix.js";

const { isBoolean, isObject, isString, isArray, isArrayOfStrings } = utils;

/* Git Command Registry */
// Branch
const branch = {
  list: (async (commandInput, context) => {
    const { fs, dir } = context;
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
    const { fs, dir } = context;
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
    const { fs, dir } = context;
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
    const { fs, dir } = context;
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

// Status
const status: GitCommand<"status">["execute"] = async (
  commandInput,
  context,
) => {
  const { fs, dir } = context;
  try {
    // Fetch head status.
    const branchName = await git.currentBranch({ fs, dir, fullname: false });
    const oid = await git.resolveRef({
      fs,
      dir,
      ref: `refs/heads/${branchName}`,
    });
    const headStatus = branchName
      ? { branchName, detached: false, oid: undefined }
      : { detached: true, oid: oid.slice(0, 7), branchName: undefined };

    // Fetch and compare local versus remote.
    let upToDateStatus: { upToDate: true; remote: string } | undefined =
      undefined;
    const localRef = await git.currentBranch({ fs, dir, fullname: true });
    if (localRef) {
      const remoteAlias = await git.getConfig({
        fs,
        dir,
        path: `branch.${branchName}.remote`,
      });
      const remoteBranch = await git.getConfig({
        fs,
        dir,
        path: `branch.${branchName}.merge`,
      });
      const remoteRef = `refs/remotes/${remoteAlias}/${remoteBranch.slice("refs/heads/".length)}`;
      const localOID = await git.resolveRef({ fs, dir, ref: localRef });
      const remoteOID = await git.resolveRef({ fs, dir, ref: remoteRef });
      upToDateStatus =
        localOID === remoteOID
          ? { upToDate: true, remote: `${remoteAlias}/${remoteBranch}` }
          : undefined;
    }

    // Fetch working tree status.
    const statusMatrix = await git.statusMatrix({ fs, dir });
    const workingTreeStatus = resolveMatrix(statusMatrix);
    return {
      data: { headStatus, upToDateStatus, workingTreeStatus },
    };
  } catch (err: unknown) {
    return { error: { code: "FAILED_GIT_COMMAND", message: `${err}` } };
  }
};

/* IO Contracts */
export const inputOutputContracts: IOValidation = {
  "branch-list": {
    input: {},
    output: {
      branchList: { isRequired: true, isValid: isArrayOfStrings },
      currentBranch: { isRequired: false, isValid: isString },
    },
  },
  "branch-create": {
    input: { branchName: { isRequired: true, isValid: isString } },
    output: {
      createdBranchName: { isRequired: true, isValid: isString },
    },
  },
  "branch-delete": {
    input: { branchName: { isRequired: true, isValid: isString } },
    output: {
      deletedBranchName: { isRequired: true, isValid: isString },
      oid: { isRequired: true, isValid: isString },
    },
  },
  "tag-list": {
    input: {},
    output: {
      tagList: { isRequired: true, isValid: isArrayOfStrings },
    },
  },
  status: {
    input: {},
    output: {
      headStatus: {
        isRequired: true,
        isValid: (ele) =>
          isObject(ele) &&
          isBoolean(ele.detached) &&
          (ele.branchName ? isString(ele.branchName) : true),
      },
      upToDateStatus: {
        isRequired: true,
        isValid: (ele) => (ele ? isBoolean(ele) : true),
      },
      workingTreeStatus: {
        isRequired: true,
        isValid: (ele: unknown) => {
          return (
            isObject(ele) &&
            isArray(ele.untracked) &&
            isArrayOfStrings(ele.untracked) &&
            isArray(ele.staged) &&
            isArrayOfStrings(ele.staged) &&
            isArray(ele.unstaged) &&
            isArrayOfStrings(ele.unstaged)
          );
        },
      },
    },
  },
};

const program = "vgit";
/* Git Command Tree */
const gitCommandTree: GitCommandTree = {
  type: "root",
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
  status: {
    type: "command",
    id: "status",
    description:
      "Display head status, up to date status, and working tree status",
    usage: "vgit status",
    io: inputOutputContracts["status"],
    execute: status,
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
