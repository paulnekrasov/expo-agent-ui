// @ts-check
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const {
  resolveWasmAssets,
  runBuild,
} = require("../esbuild.config.js");

/**
 * @typedef {{
 *   ok: boolean;
 *   command: string;
 *   args: string[];
 *   status: number | null;
 *   signal: NodeJS.Signals | null;
 *   error?: ErrorSummary;
 * }} SpawnProbeSummary
 */

/**
 * @typedef {{
 *   ok: boolean;
 *   logMessages: string[];
 *   error?: ErrorSummary;
 *   cause?: ErrorSummary;
 * }} BuildSummary
 */

/**
 * @typedef {{
 *   code?: string;
 *   errno?: number;
 *   message: string;
 *   name: string;
 *   path?: string;
 *   stack?: string;
 *   syscall?: string;
 * }} ErrorSummary
 */

/**
 * @typedef {{
 *   exists: boolean;
 *   name: string;
 *   source: string;
 *   target: string;
 * }} WasmAssetSummary
 */

/**
 * @typedef {{
 *   arch: string;
 *   ci: string | null;
 *   computerName: string | null;
 *   cwd: string;
 *   execPath: string;
 *   execPathExists: boolean;
 *   nodeVersion: string;
 *   pid: number;
 *   platform: NodeJS.Platform;
 *   sessionName: string | null;
 *   userDomain: string | null;
 *   userName: string | null;
 * }} RuntimeSnapshot
 */

/**
 * @typedef {{
 *   nextStep: string;
 *   reason: string;
 *   status:
 *     | "build_ready"
 *     | "environment_blocks_child_processes"
 *     | "direct_probe_failed"
 *     | "missing_wasm_assets"
 *     | "repo_local_build_failure_after_spawn";
 * }} DiagnosticsSummary
 */

/**
 * @typedef {{
 *   build: BuildSummary;
 *   directProbe: SpawnProbeSummary;
 *   projectRoot: string;
 *   runtime: RuntimeSnapshot;
 *   summary: DiagnosticsSummary;
 *   timestamp: string;
 *   wasmAssets: WasmAssetSummary[];
 * }} DiagnosticsResult
 */

/**
 * @param {unknown} error
 * @returns {ErrorSummary | undefined}
 */
function summarizeError(error) {
  if (!(error instanceof Error)) {
    return undefined;
  }

  /** @type {NodeJS.ErrnoException} */
  const errnoError = error;

  return {
    code: typeof errnoError.code === "string" ? errnoError.code : undefined,
    errno: typeof errnoError.errno === "number" ? errnoError.errno : undefined,
    message: error.message,
    name: error.name,
    path: typeof errnoError.path === "string" ? errnoError.path : undefined,
    stack: error.stack,
    syscall:
      typeof errnoError.syscall === "string" ? errnoError.syscall : undefined,
  };
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {RuntimeSnapshot}
 */
function collectRuntimeSnapshot(env = process.env) {
  return {
    arch: process.arch,
    ci: env.CI ?? null,
    computerName: env.COMPUTERNAME ?? null,
    cwd: process.cwd(),
    execPath: process.execPath,
    execPathExists: fs.existsSync(process.execPath),
    nodeVersion: process.version,
    pid: process.pid,
    platform: process.platform,
    sessionName: env.SESSIONNAME ?? null,
    userDomain: env.USERDOMAIN ?? null,
    userName: env.USERNAME ?? null,
  };
}

/**
 * @param {(command: string, args: string[], options: { encoding: "utf8" }) => {
 *   error?: NodeJS.ErrnoException;
 *   signal: NodeJS.Signals | null;
 *   status: number | null;
 * }} [spawnSyncImpl]
 * @returns {SpawnProbeSummary}
 */
function probeChildProcessSpawn(spawnSyncImpl = childProcess.spawnSync) {
  const command = process.execPath;
  const args = ["-e", "process.exit(0)"];
  const result = spawnSyncImpl(command, args, { encoding: "utf8" });

  if (result.error) {
    return {
      args,
      command,
      error: summarizeError(result.error),
      ok: false,
      signal: result.signal,
      status: result.status,
    };
  }

  return {
    args,
    command,
    ok: true,
    signal: result.signal,
    status: result.status,
  };
}

/**
 * @param {{
 *   build: BuildSummary;
 *   directProbe: SpawnProbeSummary;
 *   wasmAssets: WasmAssetSummary[];
 * }} input
 * @returns {DiagnosticsSummary}
 */
function summarizeDiagnostics(input) {
  const missingAssets = input.wasmAssets.filter((asset) => !asset.exists);
  if (missingAssets.length > 0) {
    return {
      nextStep:
        "Restore the missing WASM source files before treating this as an automation-environment problem.",
      reason: `Missing WASM assets: ${missingAssets
        .map((asset) => asset.name)
        .join(", ")}`,
      status: "missing_wasm_assets",
    };
  }

  if (!input.directProbe.ok) {
    if (input.directProbe.error?.code === "EPERM") {
      return {
        nextStep:
          "The automation environment is denying child-process creation before esbuild starts. Check the runner policy, token, or Windows execution controls for non-interactive child-process launch.",
        reason:
          "The direct child-process probe failed with EPERM before the repo build entered esbuild.",
        status: "environment_blocks_child_processes",
      };
    }

    return {
      nextStep:
        "Inspect the direct probe error first; the environment is failing before the repo build path reaches esbuild.",
      reason: "The direct child-process probe failed.",
      status: "direct_probe_failed",
    };
  }

  if (!input.build.ok) {
    return {
      nextStep:
        "Child-process spawning works here, so inspect the repo-local build failure after the spawn gate.",
      reason:
        "The direct child-process probe passed, but the build still failed afterward.",
      status: "repo_local_build_failure_after_spawn",
    };
  }

  return {
    nextStep:
      "No active child-process blocker is present in this run. If automation still fails elsewhere, capture this diagnostics output from that failing environment.",
    reason:
      "The direct child-process probe passed and the repo build completed.",
    status: "build_ready",
  };
}

/**
 * @param {{
 *   env?: NodeJS.ProcessEnv;
 *   projectRoot?: string;
 *   resolveWasmAssetsImpl?: typeof resolveWasmAssets;
 *   runBuildImpl?: typeof runBuild;
 *   spawnSyncImpl?: typeof childProcess.spawnSync;
 * }} [options]
 * @returns {Promise<DiagnosticsResult>}
 */
async function runAutomationBuildDiagnostics(options = {}) {
  const env = options.env ?? process.env;
  const projectRoot =
    options.projectRoot ?? path.resolve(__dirname, "..");
  const resolveWasmAssetsImpl =
    options.resolveWasmAssetsImpl ?? resolveWasmAssets;
  const runBuildImpl = options.runBuildImpl ?? runBuild;
  const spawnSyncImpl = options.spawnSyncImpl;

  const logMessages = [];
  const logger = {
    /**
     * @param {string} message
     */
    log(message) {
      logMessages.push(message);
    },
  };

  const wasmAssets = resolveWasmAssetsImpl(projectRoot).map((asset) => ({
    exists: fs.existsSync(asset.source),
    name: asset.name,
    source: asset.source,
    target: asset.target,
  }));

  const directProbe = probeChildProcessSpawn(spawnSyncImpl);

  /** @type {BuildSummary} */
  let build;
  try {
    await runBuildImpl({
      logger,
      projectRoot,
      spawnSyncImpl,
    });
    build = {
      logMessages,
      ok: true,
    };
  } catch (error) {
    build = {
      cause:
        error &&
        typeof error === "object" &&
        "cause" in error &&
        error.cause instanceof Error
          ? summarizeError(error.cause)
          : undefined,
      error: summarizeError(error),
      logMessages,
      ok: false,
    };
  }

  const summary = summarizeDiagnostics({
    build,
    directProbe,
    wasmAssets,
  });

  return {
    build,
    directProbe,
    projectRoot,
    runtime: collectRuntimeSnapshot(env),
    summary,
    timestamp: new Date().toISOString(),
    wasmAssets,
  };
}

if (require.main === module) {
  runAutomationBuildDiagnostics()
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(
        `${JSON.stringify(
          {
            error: summarizeError(error),
            status: "diagnostics_script_failed",
          },
          null,
          2
        )}\n`
      );
      process.exit(1);
    });
}

module.exports = {
  collectRuntimeSnapshot,
  probeChildProcessSpawn,
  runAutomationBuildDiagnostics,
  summarizeDiagnostics,
  summarizeError,
};
