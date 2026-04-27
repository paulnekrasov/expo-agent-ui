#!/usr/bin/env node
import { getAgentUICliManifest } from "./index";

const manifest = getAgentUICliManifest();

process.stdout.write(
  [
    "Expo Agent UI CLI",
    `stage: ${manifest.stage}`,
    `deferred commands: ${manifest.deferredCommands.join(", ")}`
  ].join("\n") + "\n"
);
