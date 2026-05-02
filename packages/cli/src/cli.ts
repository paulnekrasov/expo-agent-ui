#!/usr/bin/env node
import { getAgentUICliManifest } from "./index.js";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

function readCliVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(pathResolve(__dirname, "..", "package.json"), "utf8")
    ) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  process.stdout.write(`${readCliVersion()}\n`);
  process.exit(0);
}

const manifest = getAgentUICliManifest();

process.stdout.write(
  [
    "Expo Agent UI CLI",
    `version: ${readCliVersion()}`,
    `stage: ${manifest.stage}`,
    `implemented commands: ${manifest.implementedCommands.join(", ")}`,
    `deferred commands: ${manifest.deferredCommands.join(", ")}`
  ].join("\n") + "\n"
);
