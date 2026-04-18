import { describe, expect, it } from "@jest/globals";
import { readFileSync } from "node:fs";
import * as path from "node:path";

const repoRoot = path.resolve(__dirname, "..", "..");

describe("packaging configuration", () => {
  it("runs the production bundle before VSIX packaging", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(repoRoot, "package.json"), "utf8")
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["vscode:prepublish"]).toBe("npm run package");
  });

  it("excludes the root Swift grammar WASM from packaged output", () => {
    const vscodeIgnoreLines = readFileSync(
      path.join(repoRoot, ".vscodeignore"),
      "utf8"
    )
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    expect(vscodeIgnoreLines).toContain("tree-sitter-swift.wasm");
  });

  it("excludes repo-only diagnostics scripts from packaged output", () => {
    const vscodeIgnoreLines = readFileSync(
      path.join(repoRoot, ".vscodeignore"),
      "utf8"
    )
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    expect(vscodeIgnoreLines).toContain("scripts/**");
  });
});
