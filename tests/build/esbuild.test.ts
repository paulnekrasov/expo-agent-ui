import { afterEach, describe, expect, it, jest } from "@jest/globals";
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
import type { BuildOptions } from "esbuild";

type WasmAsset = {
  name: string;
  source: string;
  target: string;
};

type BuildTargets = {
  extension: BuildOptions;
  webview: BuildOptions;
};

type BuildLogger = {
  log(message: string): void;
};

type WatchContext = {
  watch(): Promise<unknown>;
};

type SpawnProbeResult = {
  error?: NodeJS.ErrnoException;
  signal: NodeJS.Signals | null;
  status: number | null;
  stderr?: string;
  stdout?: string;
};

type SpawnSyncImpl = (
  command: string,
  args: string[],
  options: { encoding: "utf8" }
) => SpawnProbeResult;

type EsbuildApi = {
  build(options: BuildOptions): Promise<unknown>;
  context?(options: BuildOptions): Promise<WatchContext>;
};

type BuildModule = {
  REQUIRED_WASM_ASSETS: readonly WasmAsset[];
  getBuildOptions(options?: {
    production?: boolean;
    projectRoot?: string;
  }): BuildTargets;
  copyWasmAssets(options?: {
    projectRoot?: string;
    logger?: BuildLogger;
  }): void;
  assertChildProcessSpawnAvailable(options?: {
    spawnSyncImpl?: SpawnSyncImpl;
  }): void;
  runBuild(options?: {
    esbuildApi?: EsbuildApi;
    logger?: BuildLogger;
    production?: boolean;
    projectRoot?: string;
    spawnSyncImpl?: SpawnSyncImpl;
    watch?: boolean;
  }): Promise<void>;
};

const repoRoot = path.resolve(__dirname, "..", "..");
const buildModulePath = path.join(repoRoot, "esbuild.config.js");
const tempDirectories: string[] = [];
const silentLogger: BuildLogger = {
  log: () => undefined,
};

function loadBuildModule(): BuildModule | undefined {
  jest.resetModules();

  try {
    return require(buildModulePath) as BuildModule;
  } catch {
    return undefined;
  }
}

function createSandbox(options: {
  missing?: "core" | "swift";
} = {}): string {
  const projectRoot = mkdtempSync(
    path.join(tmpdir(), "swiftui-preview-esbuild-")
  );
  tempDirectories.push(projectRoot);

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

afterEach(() => {
  while (tempDirectories.length > 0) {
    const projectRoot = tempDirectories.pop();
    if (projectRoot) {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  }

  jest.restoreAllMocks();
});

describe("esbuild build configuration", () => {
  it("exports build options for both extension bundles", () => {
    const buildModule = loadBuildModule();

    expect(buildModule?.getBuildOptions).toBeDefined();
    if (!buildModule) {
      return;
    }

    const options = buildModule.getBuildOptions({ projectRoot: repoRoot });

    expect(options.extension.absWorkingDir).toBe(repoRoot);
    expect(options.extension.entryPoints).toContain(
      path.join("src", "extension", "extension.ts")
    );
    expect(options.extension.bundle).toBe(true);
    expect(options.extension.outfile).toBe(
      path.join("out", "extension", "extension.js")
    );
    expect(options.extension.external).toContain("vscode");
    expect(options.extension.loader?.[".wasm"]).toBeUndefined();

    expect(options.webview.absWorkingDir).toBe(repoRoot);
    expect(options.webview.entryPoints).toContain(
      path.join("src", "webview", "preview.ts")
    );
    expect(options.webview.bundle).toBe(true);
    expect(options.webview.outfile).toBe(path.join("out", "webview", "preview.js"));
    expect(options.webview.loader?.[".wasm"]).toBeUndefined();
  });

  it("defines exact WASM filenames without hash-mangling", () => {
    const buildModule = loadBuildModule();

    expect(buildModule?.REQUIRED_WASM_ASSETS).toBeDefined();
    if (!buildModule) {
      return;
    }

    const sourceNames = buildModule.REQUIRED_WASM_ASSETS.map((asset) =>
      path.basename(asset.source)
    );
    const targetNames = buildModule.REQUIRED_WASM_ASSETS.map((asset) =>
      path.basename(asset.target)
    );

    expect(sourceNames).toEqual([
      "web-tree-sitter.wasm",
      "tree-sitter-swift.wasm",
    ]);
    expect(targetNames).toEqual([
      "web-tree-sitter.wasm",
      "tree-sitter-swift.wasm",
    ]);

    for (const targetName of targetNames) {
      expect(targetName).not.toMatch(/[.-][a-f0-9]{6,}\.wasm$/i);
    }
  });

  it("references WASM source files that exist in the repository", () => {
    const buildModule = loadBuildModule();

    expect(buildModule?.REQUIRED_WASM_ASSETS).toBeDefined();
    if (!buildModule) {
      return;
    }

    for (const asset of buildModule.REQUIRED_WASM_ASSETS) {
      expect(existsSync(path.join(repoRoot, asset.source))).toBe(true);
    }
  });

  it.each([
    {
      message: "web-tree-sitter.wasm",
      missing: "core" as const,
      outputFile: path.join("out", "web-tree-sitter.wasm"),
    },
    {
      message: "tree-sitter-swift.wasm",
      missing: "swift" as const,
      outputFile: path.join("out", "tree-sitter-swift.wasm"),
    },
  ])(
    "removes stale output and reports missing $message sources before build",
    ({ message, missing, outputFile }) => {
      const buildModule = loadBuildModule();

      expect(buildModule?.copyWasmAssets).toBeDefined();
      if (!buildModule) {
        return;
      }

      const projectRoot = createSandbox({ missing });

      expect(() =>
        buildModule.copyWasmAssets({
          logger: silentLogger,
          projectRoot,
        })
      ).toThrow(message);
      expect(existsSync(path.join(projectRoot, outputFile))).toBe(false);
    }
  );

  it("uses esbuild's programmatic API to build both bundles", async () => {
    const buildModule = loadBuildModule();

    expect(buildModule?.runBuild).toBeDefined();
    if (!buildModule) {
      return;
    }

    const projectRoot = createSandbox();
    const buildMock = jest.fn(async (_options: BuildOptions) => ({}));
    const contextMock = jest.fn(async (_options: BuildOptions) => ({
      watch: async () => undefined,
    }));
    const esbuildApi: EsbuildApi = {
      build: buildMock,
      context: contextMock,
    };
    const spawnSyncImpl = jest.fn<SpawnSyncImpl>(() => ({
      signal: null,
      status: 0,
      stderr: "",
      stdout: "",
    }));

    await buildModule.runBuild({
      esbuildApi,
      logger: silentLogger,
      projectRoot,
      spawnSyncImpl,
    });

    const options = buildModule.getBuildOptions({ projectRoot });

    expect(spawnSyncImpl).toHaveBeenCalledTimes(1);
    expect(buildMock).toHaveBeenCalledTimes(2);
    expect(buildMock).toHaveBeenNthCalledWith(1, options.extension);
    expect(buildMock).toHaveBeenNthCalledWith(2, options.webview);
    expect(contextMock).not.toHaveBeenCalled();
    expect(
      readFileSync(path.join(projectRoot, "out", "web-tree-sitter.wasm"), "utf8")
    ).toBe("core-wasm");
    expect(
      readFileSync(path.join(projectRoot, "out", "tree-sitter-swift.wasm"), "utf8")
    ).toBe("swift-wasm");
  });

  it("fails fast with a classified message when child-process spawning is denied", async () => {
    const buildModule = loadBuildModule();

    expect(buildModule?.runBuild).toBeDefined();
    if (!buildModule) {
      return;
    }

    const projectRoot = createSandbox();
    const buildMock = jest.fn(async (_options: BuildOptions) => ({}));
    const spawnError = Object.assign(
      new Error("spawnSync C:\\Program Files\\nodejs\\node.exe EPERM"),
      {
        code: "EPERM",
        errno: -4048,
        path: "C:\\Program Files\\nodejs\\node.exe",
        spawnargs: ["-e", "process.exit(0)"],
        syscall: "spawnSync C:\\Program Files\\nodejs\\node.exe",
      }
    ) as NodeJS.ErrnoException;
    const spawnSyncImpl = jest.fn<SpawnSyncImpl>(() => ({
      error: spawnError,
      signal: null,
      status: null,
      stderr: "",
      stdout: "",
    }));

    await expect(
      buildModule.runBuild({
        esbuildApi: {
          build: buildMock,
        },
        logger: silentLogger,
        projectRoot,
        spawnSyncImpl,
      })
    ).rejects.toThrow(
      "Build verification blocked before esbuild started: child-process execution is denied in the current environment."
    );

    expect(spawnSyncImpl).toHaveBeenCalledTimes(1);
    expect(buildMock).not.toHaveBeenCalled();
  });
});
