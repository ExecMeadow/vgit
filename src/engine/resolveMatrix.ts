import { InputOutputContracts as IO } from "../types.js";

type StatusMatrix = [string, number, number, number][];

export default function resolveMatrix(
  statusMatrix: StatusMatrix,
): IO["status"]["output"]["workingTreeStatus"] {
  const staged: [string, string][] = [];
  const unstaged: [string, string][] = [];
  const untracked = [];

  for (const [file, head, workdir, stage] of statusMatrix) {
    // Staged changes.
    if (head !== stage) {
      const fileStatus =
        head === 0 ? "new file" : stage === 0 ? "deleted" : "modified";
      staged.push([file, fileStatus]);
    }

    // Untracked files.
    if (stage === 0 && workdir !== 0) {
      untracked.push(file);
      continue;
    }

    // Unstaged changes.
    if (workdir !== stage) {
      const fileStatus = workdir === 0 ? "deleted" : "modified";
      unstaged.push([file, fileStatus]);
    }
  }

  return { untracked, staged, unstaged };
}
