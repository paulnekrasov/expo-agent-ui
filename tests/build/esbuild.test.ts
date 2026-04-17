import { afterEach, describe, expect, it } from "@jest/globals";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";

const repoRoot = path.resolve(__dirname, "..", "..");
const esbuildScriptSource = readFileSync(
  path.join(repoRoot, "esbuild.js"),
  "utf8"
);

const tempDirectories: string[] = [];

function writeEsbuildStub(projectRoot: string): void {
  const esbuildModuleDir = path.join(projectRoot, "node_modules", "esbuild");
  mkdirSync(esbuildModuleDir, { recursive: true });
  writeFileSync(
    path.join(esbuildModuleDir, "index.js"),
    [
      "exports.build = async function build() { return {}; };",
      "exports.context = async function context() {",
      "  return { watch: async function watch() { return {}; } };",
      "};",
      "",
    ].join("\n"),
    "utf8"
  );
}

function createSandbox(options: {
  missing?: "core" | "swift";
} = {}): string {
  const projectRoot = mkdtempSync(
    path.join(tmpdir(), "swiftui-preview-esbuild-")
  );
  tempDirectories.push(projectRoot);

  writeFileSync(path.join(projectRoot, "esbuild.js"), esbuildScriptSource, "utf8");
  writeEsbuildStub(projectRoot);

  const webTreeSitterDir = path.join(
    projectRoot,
    "node_modules",
    "web-tree-sitter"
  );
  mkdirSync(webTreeSitterDir, { recursive: true });

  if (options.missing !== "core") {
    writeFileSync(
      path.join(webTreeSitterDir, "web-tree-sitter.wasm"),
      "core-wasm",
      "utf8"
    );
  }

  if (options.missing !== "swift") {
    writeFileSync(
      path.join(projectRoot, "tree-sitter-swift.wasm"),
      "swift-wasm",
      "utf8"
    );
  }

  const outDir = path.join(projectRoot, "out");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "web-tree-sitter.wasm"), "stale-core", "utf8");
  writeFileSync(path.join(outDir, "tree-sitter-swift.wasm"), "stale-swift", "utf8");

  return projectRoot;
}

function runBuild(projectRoot: string) {
  return spawnSync(process.execPath, ["esbuild.js"], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

afterEach(() => {
  while (tempDirectories.length > 0) {
    const projectRoot = tempDirectories.pop();
    if (projectRoot) {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  }
});

describe("esbuild build script", () => {
  it("copies both required WASM assets when sources are present", () => {
    const projectRoot = createSandbox();

    const result = runBuild(projectRoot);

    expect(result.status).toBe(0);
    expect(
      readFileSync(path.join(projectRoot, "out", "web-tree-sitter.wasm"), "utf8")
    ).toBe("core-wasm");
    expect(
      readFileSync(path.join(projectRoot, "out", "tree-sitter-swift.wasm"), "utf8")
    ).toBe("swift-wasm");
  });

  it.each([
    {
      missing: "core" as const,
      outputFile: path.join("out", "web-tree-sitter.wasm"),
      message: "web-tree-sitter.wasm",
    },
    {
      missing: "swift" as const,
      outputFile: path.join("out", "tree-sitter-swift.wasm"),
      message: "tree-sitter-swift.wasm",
    },
  ])(
    "fails fast and removes stale output when $message is missing",
    ({ missing, outputFile, message }) => {
      const projectRoot = createSandbox({ missing });

      const result = runBuild(projectRoot);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}\n${result.stderr}`).toContain(message);
      expect(existsSync(path.join(projectRoot, outputFile))).toBe(false);
    }
  );
});
