// @ts-check
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const isWatch = process.argv.includes("--watch");
const isProduction = process.argv.includes("--production");

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

  // web-tree-sitter runtime WASM (v0.26+ uses web-tree-sitter.wasm)
  const treeSitterWasm = path.join(
    "node_modules",
    "web-tree-sitter",
    "web-tree-sitter.wasm"
  );
  if (fs.existsSync(treeSitterWasm)) {
    fs.copyFileSync(treeSitterWasm, path.join("out", "web-tree-sitter.wasm"));
    console.log("Copied web-tree-sitter.wasm");
  } else {
    console.warn("WARNING: web-tree-sitter.wasm not found in web-tree-sitter");
  }

  // Swift grammar WASM
  const swiftWasm = "tree-sitter-swift.wasm";
  if (fs.existsSync(swiftWasm)) {
    fs.copyFileSync(swiftWasm, path.join("out", "tree-sitter-swift.wasm"));
    console.log("Copied tree-sitter-swift.wasm");
  } else {
    console.warn("WARNING: tree-sitter-swift.wasm not found — run: tree-sitter build --wasm tree-sitter-swift/");
  }
}

async function build() {
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
