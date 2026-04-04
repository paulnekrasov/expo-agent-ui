import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Language, Parser } from "web-tree-sitter";

import { log } from "../extension/outputChannel";

export interface TreeSitterSetupOptions {
  extensionUri?: vscode.Uri;
}

export interface TreeSitterRuntime {
  language: Language;
  parser: Parser;
}

let runtimePromise: Promise<TreeSitterRuntime> | undefined;

function resolveCoreWasmPath(extensionUri?: vscode.Uri): string {
  if (extensionUri) {
    return vscode.Uri.joinPath(
      extensionUri,
      "out",
      "web-tree-sitter.wasm"
    ).fsPath;
  }

  const candidates = [
    path.resolve(__dirname, "..", "web-tree-sitter.wasm"),
    path.resolve(__dirname, "..", "..", "out", "web-tree-sitter.wasm"),
    path.resolve(
      __dirname,
      "..",
      "..",
      "node_modules",
      "web-tree-sitter",
      "web-tree-sitter.wasm"
    ),
  ];

  const resolvedCandidate = candidates.find((candidate) =>
    fs.existsSync(candidate)
  );

  return resolvedCandidate ?? path.resolve(__dirname, "..", "web-tree-sitter.wasm");
}

function resolveSwiftWasmPath(extensionUri?: vscode.Uri): string {
  if (extensionUri) {
    return vscode.Uri.joinPath(
      extensionUri,
      "out",
      "tree-sitter-swift.wasm"
    ).fsPath;
  }

  const candidates = [
    path.resolve(__dirname, "..", "tree-sitter-swift.wasm"),
    path.resolve(__dirname, "..", "..", "out", "tree-sitter-swift.wasm"),
    path.resolve(__dirname, "..", "..", "tree-sitter-swift.wasm"),
  ];

  const resolvedCandidate = candidates.find((candidate) =>
    fs.existsSync(candidate)
  );

  return resolvedCandidate ?? path.resolve(__dirname, "..", "tree-sitter-swift.wasm");
}

async function createRuntime(
  options: TreeSitterSetupOptions
): Promise<TreeSitterRuntime> {
  const coreWasmPath = resolveCoreWasmPath(options.extensionUri);
  const swiftWasmPath = resolveSwiftWasmPath(options.extensionUri);

  await Parser.init({
    locateFile(scriptName: string): string {
      if (scriptName.endsWith(".wasm")) {
        return coreWasmPath;
      }

      return scriptName;
    },
  });

  const language = await Language.load(swiftWasmPath);
  const parser = new Parser();
  parser.setLanguage(language);

  log(`Stage 1 parser ready (${language.name ?? "unknown-language"})`);

  return { language, parser };
}

export async function getTreeSitterRuntime(
  options: TreeSitterSetupOptions = {}
): Promise<TreeSitterRuntime> {
  if (!runtimePromise) {
    runtimePromise = createRuntime(options).catch((error) => {
      runtimePromise = undefined;
      throw error;
    });
  }

  return runtimePromise;
}

export function resetTreeSitterRuntime(): void {
  runtimePromise = undefined;
}
