import test from "node:test";
import assert from "node:assert/strict";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

function isGitInstalled() {
  try {
    execFileSync("git", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
const skip = !isGitInstalled
  ? "Native Git is unavailable. Make sure to install git."
  : false;
function initializeRepository(repoPath: string) {
  const git = (...args: string[]) => {
    return execFileSync("git", args, {
      cwd: repoPath,
      encoding: "utf8",
    }).trim();
  };

  git("init", "-b", "main");
  git("config", "user.name", "Test User");
  git("config", "user.email", "test@example.com");
  git("commit", "--allow-empty", "-m", "Initial commit");
}

function vgit(repo: string, ...args: string[]) {
  const cli = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: repo,
    encoding: "utf8",
  }).trim();
}

// Test.
test("Integration: list, create, and delete branches.", { skip }, () => {
  const tempRepo = fs.mkdtempSync(path.join(os.tmpdir(), "vgit-test-"));
  try {
    initializeRepository(tempRepo);

    const list = vgit(tempRepo, "branch", "list");
    assert.strictEqual(
      list,
      "Branches:\n1 branch found.\n main (current branch)",
    );

    const resultOfCreate = vgit(tempRepo, "branch", "create", "test-branch");
    assert.strictEqual(resultOfCreate, "Created branch 'test-branch'.");
    const listAfterCreate = vgit(tempRepo, "branch", "list");
    assert.strictEqual(
      listAfterCreate,
      "Branches:\n2 branches found.\n main (current branch)\n test-branch",
    );

    const resultOfDelete = vgit(tempRepo, "branch", "delete", "test-branch");
    assert.match(
      resultOfDelete,
      /^Deleted branch 'test-branch' \(was [0-9a-f]{7}\).$/,
    );
    const listAfterDelete = vgit(tempRepo, "branch", "list");
    assert.strictEqual(
      listAfterDelete,
      "Branches:\n1 branch found.\n main (current branch)",
    );
  } finally {
    fs.rmSync(tempRepo, { recursive: true, force: true });
  }
});
