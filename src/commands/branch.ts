import git from "isomorphic-git";
import repository from "./repo.js";

import { Leaf } from "../types.js";

const program = "vgit";
const domain = "branch";

// Commands
export default {
  list: {
    description: "List branches",
    usage: `${program} ${domain} list`,
    execute: branchList,
  },
  create: {
    description: "Create a branch",
    usage: `${program} ${domain} create`,
    execute: branchCreate,
  },
  delete: {
    description: "Delete a branch",
    usage: `${program} ${domain} delete`,
    execute: branchDelete,
  },
} as Record<string, Leaf>;

// Methods
async function branchList() {
  const branchList = await git.listBranches({
    fs: repository.fs,
    dir: repository.dir,
  });
  /* 
    const currentBranch = await git.currentBranch({
    fs: repository.fs,
    dir: repository.dir,
  });
  */
  return {
    // command: "branch list",
    //    data: { branches: branchList, currentBranch },
    outputs: [
      { type: "text", value: "Branches:" },
      {
        type: "text",
        value: `${branchList.length} branch${branchList.length === 1 ? "" : "es"} found.`,
      },
      { type: "indentedList", values: branchList },
    ],
  };
}

async function branchCreate() {
  return { outputs: [] };
}

async function branchDelete() {
  return { outputs: [] };
}
