import { describe, expect, it, jest } from "@jest/globals";

type ErrorSummary = {
  code?: string;
  message: string;
  name: string;
  syscall?: string;
};

type DiagnosticsSummary = {
  nextStep: string;
  reason: string;
  status:
    | "build_ready"
    | "environment_blocks_child_processes"
    | "direct_probe_failed"
    | "missing_wasm_assets"
    | "repo_local_build_failure_after_spawn";
};

type SpawnProbeSummary = {
  ok: boolean;
  command: string;
  args: string[];
  status: number | null;
  signal: NodeJS.Signals | null;
  error?: ErrorSummary;
};

type BuildSummary = {
  ok: boolean;
  logMessages: string[];
  error?: ErrorSummary;
  cause?: ErrorSummary;
};

type DiagnosticsResult = {
  build: BuildSummary;
  directProbe: SpawnProbeSummary;
  projectRoot: string;
  runtime: {
    execPath: string;
    execPathExists: boolean;
    userName: string | null;
  };
  summary: DiagnosticsSummary;
  timestamp: string;
  wasmAssets: Array<{
    exists: boolean;
    name: string;
    source: string;
    target: string;
  }>;
};

type DiagnosticsModule = {
  probeChildProcessSpawn(
    spawnSyncImpl?: (
      command: string,
      args: string[],
      options: { encoding: "utf8" }
    ) => {
      error?: NodeJS.ErrnoException;
      signal: NodeJS.Signals | null;
      status: number | null;
    }
  ): SpawnProbeSummary;
  runAutomationBuildDiagnostics(options?: {
    env?: NodeJS.ProcessEnv;
    projectRoot?: string;
    resolveWasmAssetsImpl?: (projectRoot: string) => Array<{
      name: string;
      source: string;
      target: string;
    }>;
    runBuildImpl?: (options: {
      logger?: { log(message: string): void };
      projectRoot?: string;
      spawnSyncImpl?: (
        command: string,
        args: string[],
        options: { encoding: "utf8" }
      ) => {
        error?: NodeJS.ErrnoException;
        signal: NodeJS.Signals | null;
        status: number | null;
      };
    }) => Promise<void>;
    spawnSyncImpl?: (
      command: string,
      args: string[],
      options: { encoding: "utf8" }
    ) => {
      error?: NodeJS.ErrnoException;
      signal: NodeJS.Signals | null;
      status: number | null;
    };
  }): Promise<DiagnosticsResult>;
};

const diagnosticsModulePath =
  "../../scripts/build-diagnostics.js";

function loadDiagnosticsModule(): DiagnosticsModule {
  jest.resetModules();
  return require(diagnosticsModulePath) as DiagnosticsModule;
}

describe("build diagnostics", () => {
  it("reports a passing direct child-process probe", () => {
    const diagnosticsModule = loadDiagnosticsModule();
    const spawnSyncImpl = jest.fn(() => ({
      signal: null,
      status: 0,
    }));

    const result = diagnosticsModule.probeChildProcessSpawn(spawnSyncImpl);

    expect(result.ok).toBe(true);
    expect(result.status).toBe(0);
    expect(result.error).toBeUndefined();
    expect(spawnSyncImpl).toHaveBeenCalledTimes(1);
  });

  it("classifies EPERM as an environment child-process blocker", async () => {
    const diagnosticsModule = loadDiagnosticsModule();
    const spawnError = Object.assign(new Error("spawnSync node.exe EPERM"), {
      code: "EPERM",
      errno: -4048,
      syscall: "spawnSync C:\\Program Files\\nodejs\\node.exe",
    }) as NodeJS.ErrnoException;
    const spawnSyncImpl = jest.fn(() => ({
      error: spawnError,
      signal: null,
      status: null,
    }));
    const runBuildImpl = jest.fn(async () => {
      throw Object.assign(
        new Error(
          "Build verification blocked before esbuild started: child-process execution is denied in the current environment."
        ),
        { cause: spawnError }
      );
    });

    const result = await diagnosticsModule.runAutomationBuildDiagnostics({
      projectRoot: "C:\\repo",
      resolveWasmAssetsImpl: () => [
        {
          name: "web-tree-sitter.wasm",
          source: __filename,
          target: "C:\\repo\\out\\web-tree-sitter.wasm",
        },
      ],
      runBuildImpl,
      spawnSyncImpl,
    });

    expect(result.summary.status).toBe("environment_blocks_child_processes");
    expect(result.directProbe.ok).toBe(false);
    expect(result.directProbe.error?.code).toBe("EPERM");
    expect(result.build.ok).toBe(false);
  });

  it("distinguishes repo-local build failures after the spawn gate", async () => {
    const diagnosticsModule = loadDiagnosticsModule();
    const spawnSyncImpl = jest.fn(() => ({
      signal: null,
      status: 0,
    }));
    const runBuildImpl = jest.fn(async () => {
      throw new Error("esbuild failed after the direct probe passed");
    });

    const result = await diagnosticsModule.runAutomationBuildDiagnostics({
      projectRoot: "C:\\repo",
      resolveWasmAssetsImpl: () => [
        {
          name: "tree-sitter-swift.wasm",
          source: __filename,
          target: "C:\\repo\\out\\tree-sitter-swift.wasm",
        },
      ],
      runBuildImpl,
      spawnSyncImpl,
    });

    expect(result.summary.status).toBe("repo_local_build_failure_after_spawn");
    expect(result.directProbe.ok).toBe(true);
    expect(result.build.ok).toBe(false);
  });
});
