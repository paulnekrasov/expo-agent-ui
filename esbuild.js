// @ts-check
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("node:child_process");

const isWatch = process.argv.includes("--watch");
const isProduction = process.argv.includes("--production");

function getRequiredWasmAssets() {
  return [
    {
      name: "web-tree-sitter.wasm",
      source: path.join(
        "node_modules",
        "web-tree-sitter",
        "web-tree-sitter.wasm"
      ),
      target: path.join("out", "web-tree-sitter.wasm"),
    },
    {
      name: "tree-sitter-swift.wasm",
      source: "tree-sitter-swift.wasm",
      target: path.join("out", "tree-sitter-swift.wasm"),
    },
  ];
}

function formatSpawnError(error) {
  const parts = [];

  if (error.code) {
    parts.push(`code=${error.code}`);
  }
  if (error.errno !== undefined) {
    parts.push(`errno=${error.errno}`);
  }
  if (error.syscall) {
    parts.push(`syscall=${error.syscall}`);
  }
  if (error.message) {
    parts.push(`message=${error.message}`);
  }

  return parts.join(", ");
}

function verifyChildProcessSpawn() {
  // esbuild boots a background service via child_process.spawn().
  const probe = spawnSync(process.execPath, ["-e", "process.exit(0)"], {
    stdio: "pipe",
    windowsHide: true,
  });

  if (probe.error) {
    throw new Error(
      [
        "Build preflight failed: Node child_process.spawn() is unavailable in this environment.",
        "esbuild requires child-process spawn to start its service, so this is an environment blocker rather than a repo bundling failure.",
        `Probe: ${process.execPath} -e \"process.exit(0)\"`,
        `Spawn error: ${formatSpawnError(probe.error)}`,
        "Retry the build in an environment that permits child processes before treating this as a Stage 2 regression.",
      ].join("\n")
    );
  }

  if (probe.status !== 0) {
    throw new Error(
      [
        "Build preflight failed: the child-process probe did not exit cleanly.",
        "esbuild requires a working child process to start its service.",
        `Probe: ${process.execPath} -e \"process.exit(0)\"`,
        `Exit status: ${probe.status}`,
        probe.signal ? `Signal: ${probe.signal}` : null,
        probe.stderr.length > 0
          ? `stderr: ${probe.stderr.toString("utf8").trim()}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
}

/** @type {import('esbuild').BuildOptions} */
const extensionConfig = {
  entryPoints: ["src/extension/extension.ts"],
  bundle: true,
  outfile: "out/extension/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  target: "node20",
  sourcemap: !isProduction,
  minify: isProduction,
  // web-tree-sitter JS is bundled; WASM files are copied separately below
};

/** @type {import('esbuild').BuildOptions} */
const webviewConfig = {
  entryPoints: ["src/webview/preview.ts"],
  bundle: true,
  outfile: "out/webview/preview.js",
  format: "iife",
  platform: "browser",
  target: "es2020",
  sourcemap: !isProduction,
  minify: isProduction,
};

function copyWasmAssets() {
  fs.mkdirSync("out", { recursive: true });

  const wasmAssets = getRequiredWasmAssets();

  // Remove stale packaged assets before validating the current sources.
  for (const asset of wasmAssets) {
    fs.rmSync(asset.target, { force: true });
  }

  const missingAssets = wasmAssets.filter((asset) => !fs.existsSync(asset.source));
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

  for (const asset of wasmAssets) {
    fs.copyFileSync(asset.source, asset.target);
    console.log(`Copied ${asset.name}`);
  }
}

async function build() {
  verifyChildProcessSpawn();
  copyWasmAssets();

  if (isWatch) {
    const [extCtx, webCtx] = await Promise.all([
      esbuild.context(extensionConfig),
      esbuild.context(webviewConfig),
    ]);
    await Promise.all([extCtx.watch(), webCtx.watch()]);
    console.log("Watching for changes...");
  } else {
    await Promise.all([
      esbuild.build(extensionConfig),
      esbuild.build(webviewConfig),
    ]);
    console.log("Build complete");
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
