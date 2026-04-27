#!/usr/bin/env node
import { getAgentUIMcpManifest } from "./index";

process.stdout.write(`${JSON.stringify(getAgentUIMcpManifest(), null, 2)}\n`);
