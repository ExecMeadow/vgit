import { TerminalUITree } from "../types.js";

// UI Registry
const branch = {
  list({ branches: branchList }: { branches: string[] }) {
    return [
      { type: "text", value: "Branches:" },
      {
        type: "text",
        value: `${branchList.length} branch${branchList.length === 1 ? "" : "es"} found.`,
      },
      { type: "indentedList", values: branchList },
    ];
  },
  create() {
    return [];
  },
  delete() {
    return [];
  },
};

// UI Tree
export default {
  branch: {
    list: branch.list,
    create: branch.create,
    delete: branch.delete,
  },
} as TerminalUITree;
