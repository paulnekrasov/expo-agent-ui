// @ts-check
const childProcess = require("child_process");
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

/**
 * @typedef {{
 *   name: string;
 *   source: string;
 *   target: string;
 * }} WasmAsset
 */

/**
 * @typedef {{
 *   extension: import("esbuild").BuildOptions;
 *   webview: import("esbuild").BuildOptions;
 * }} BuildTargets
 */

/**
 * @typedef {{
 *   build(options: import("esbuild").BuildOptions): Promise<unknown>;
 *   context?(options: import("esbuild").BuildOptions): Promise<{
 *     watch(): Promise<unknown>;
 *   }>;
 * }} EsbuildApi
 */

/**
 * @typedef {{
 *   error?: NodeJS.ErrnoException;
 *   signal: NodeJS.Signals | null;
 *   status: number | null;
 *   stderr?: string;
 *   stdout?: string;
 * }} SpawnProbeResult
 */

/**
 * @typedef {(command: string, args: string[], options: { encoding: "utf8" }) => SpawnProbeResult} SpawnSyncImpl
 */

/** @type {readonly WasmAsset[]} */
const REQUIRED_WASM_ASSETS = Object.freeze([
  {
    name: "web-tree-sitter.wasm",
    source: path.join("node_modules", "web-tree-sitter", "web-tree-sitter.wasm"),
    target: path.join("out", "web-tree-sitter.wasm"),
  },
  {
    name: "tree-sitter-swift.wasm",
    source: "tree-sitter-swift.wasm",
    target: path.join("out", "tree-sitter-swift.wasm"),
  },
]);

/**
 * @param {string} projectRoot
 * @returns {WasmAsset[]}
 */
function resolveWasmAssets(projectRoot) {
  return REQUIRED_WASM_ASSETS.map((asset) => ({
    name: asset.name,
    source: path.join(projectRoot, asset.source),
    target: path.join(projectRoot, asset.target),
  }));
}

/**
 * @param {{
 *   production?: boolean;
 *   projectRoot?: string;
 * }} [options]
 * @returns {BuildTargets}
 */
function getBuildOptions(options = {}) {
  const production = options.production ?? false;
  const projectRoot = options.projectRoot ?? process.cwd();

  return {
    extension: {
      absWorkingDir: projectRoot,
      entryPoints: [path.join("src", "extension", "extension.ts")],
      bundle: true,
      outfile: path.join("out", "extension", "extension.js"),
      external: ["vscode"],
      format: "cjs",
      platform: "node",
      target: "node20",
      sourcemap: !production,
      minify: production,
    },
    webview: {
      absWorkingDir: projectRoot,
      entryPoints: [path.join("src", "webview", "preview.ts")],
      bundle: true,
      outfile: path.join("out", "webview", "preview.js"),
      format: "iife",
      platform: "browser",
      target: "es2020",
      sourcemap: !production,
      minify: production,
    },
  };
}

/**
 * @param {{
 *   logger?: Pick<Console, "log">;
 *   projectRoot?: string;
 * }} [options]
 * @returns {void}
 */
function copyWasmAssets(options = {}) {
  const logger = options.logger ?? console;
  const projectRoot = options.projectRoot ?? process.cwd();
  const resolvedAssets = resolveWasmAssets(projectRoot);

  fs.mkdirSync(path.join(projectRoot, "out"), { recursive: true });

  for (const asset of resolvedAssets) {
    fs.rmSync(asset.target, { force: true });
  }

  const missingAssets = resolvedAssets.filter((asset) => !fs.existsSync(asset.source));
  if (missingAssets.length > 0) {
    throw new Error(
      [
        "Build preflight failed: required WASM assets are missing.",
        ...missingAssets.map(
          (asset) => `Missing: ${asset.name} (expected at ${asset.source})`
        ),
        "Restore the missing WASM source files before packaging or running the build.",
      ].join("\n")
    );
  }

  for (const asset of resolvedAssets) {
    fs.mkdirSync(path.dirname(asset.target), { recursive: true });
    fs.copyFileSync(asset.source, asset.target);
    logger.log(`Copied ${asset.name}`);
  }
}

/**
 * @param {{
 *   spawnSyncImpl?: SpawnSyncImpl;
 * }} [options]
 * @returns {void}
 */
function assertChildProcessSpawnAvailable(options = {}) {
  const spawnSyncImpl = options.spawnSyncImpl ?? childProcess.spawnSync;
  const probeResult = spawnSyncImpl(
    process.execPath,
    ["-e", "process.exit(0)"],
    { encoding: "utf8" }
  );

  if (!probeResult.error) {
    return;
  }

  const error = probeResult.error;
  const errorCode = typeof error.code === "string" ? error.code : "UNKNOWN";
  const errorSyscall =
    typeof error.syscall === "string" ? error.syscall : "spawnSync";
  const summary =
    errorCode === "EPERM"
      ? "Build verification blocked before esbuild started: child-process execution is denied in the current environment."
      : "Build verification blocked before esbuild started: the direct child-process probe failed in the current environment.";

  throw new Error(
    [
      summary,
      `Direct probe: ${errorSyscall} -> ${errorCode}`,
      "The current build path uses esbuild's Node API, which requires spawning a service process.",
      "Re-run the direct child-process probe and npm run build in a child-process-enabled environment before treating this as a repo-local regression.",
    ].join("\n"),
    { cause: error }
  );
}

/**
 * @param {{
 *   esbuildApi?: EsbuildApi;
 *   logger?: Pick<Console, "log">;
 *   production?: boolean;
 *   projectRoot?: string;
 *   spawnSyncImpl?: SpawnSyncImpl;
 *   watch?: boolean;
 * }} [options]
 * @returns {Promise<void>}
 */
async function runBuild(options = {}) {
  const esbuildApi = options.esbuildApi ?? esbuild;
  const logger = options.logger ?? console;
  const production = options.production ?? false;
  const projectRoot = options.projectRoot ?? process.cwd();
  const spawnSyncImpl = options.spawnSyncImpl;
  const watch = options.watch ?? false;
  const buildOptions = getBuildOptions({ production, projectRoot });

  assertChildProcessSpawnAvailable({ spawnSyncImpl });
  copyWasmAssets({ logger, projectRoot });

  if (watch) {
    if (typeof esbuildApi.context !== "function") {
      throw new Error("Watch mode requires esbuild.context().");
    }

    const [extensionContext, webviewContext] = await Promise.all([
      esbuildApi.context(buildOptions.extension),
      esbuildApi.context(buildOptions.webview),
    ]);
    await Promise.all([extensionContext.watch(), webviewContext.watch()]);
    logger.log("Watching for changes...");
    return;
  }

  await Promise.all([
    esbuildApi.build(buildOptions.extension),
    esbuildApi.build(buildOptions.webview),
  ]);
  logger.log("Build complete");
}

/**
 * @param {string[]} [argv]
 * @returns {Promise<void>}
 */
async function runCli(argv = process.argv.slice(2)) {
  const watch = argv.includes("--watch");
  const production = argv.includes("--production");

  await runBuild({
    logger: console,
    production,
    projectRoot: process.cwd(),
    watch,
  });
}

module.exports = {
  REQUIRED_WASM_ASSETS,
  assertChildProcessSpawnAvailable,
  copyWasmAssets,
  getBuildOptions,
  resolveWasmAssets,
  runBuild,
  runCli,
};
