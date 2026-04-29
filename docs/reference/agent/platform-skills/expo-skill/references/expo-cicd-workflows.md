# expo-cicd-workflows

Source: https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-cicd-workflows

## Source SKILL.md

---
name: expo-cicd-workflows
description: Helps understand and write EAS workflow YAML files for Expo projects. Use this skill when the user asks about CI/CD or workflows in an Expo or EAS context, mentions .eas/workflows/, or wants help with EAS build pipelines or deployment automation.
allowed-tools: "Read,Write,Bash(node:*)"
version: 1.0.0
license: MIT License
---

# EAS Workflows Skill

Help developers write and edit EAS CI/CD workflow YAML files.

## Reference Documentation

Fetch these resources before generating or validating workflow files. Use the fetch script (implemented using Node.js) in this skill's `scripts/` directory; it caches responses using ETags for efficiency:

```bash
# Fetch resources
node {baseDir}/scripts/fetch.js <url>
```

1. **JSON Schema** — https://api.expo.dev/v2/workflows/schema
   - It is NECESSARY to fetch this schema
   - Source of truth for validation
   - All job types and their required/optional parameters
   - Trigger types and configurations
   - Runner types, VM images, and all enums

2. **Syntax Documentation** — https://raw.githubusercontent.com/expo/expo/refs/heads/main/docs/pages/eas/workflows/syntax.mdx
   - Overview of workflow YAML syntax
   - Examples and English explanations
   - Expression syntax and contexts

3. **Pre-packaged Jobs** — https://raw.githubusercontent.com/expo/expo/refs/heads/main/docs/pages/eas/workflows/pre-packaged-jobs.mdx
   - Documentation for supported pre-packaged job types
   - Job-specific parameters and outputs

Do not rely on memorized values; these resources evolve as new features are added.

## Workflow File Location

Workflows live in `.eas/workflows/*.yml` (or `.yaml`).

## Top-Level Structure

A workflow file has these top-level keys:

- `name` — Display name for the workflow
- `on` — Triggers that start the workflow (at least one required)
- `jobs` — Job definitions (required)
- `defaults` — Shared defaults for all jobs
- `concurrency` — Control parallel workflow runs

Consult the schema for the full specification of each section.

## Expressions

Use `${{ }}` syntax for dynamic values. The schema defines available contexts:

- `github.*` — GitHub repository and event information
- `inputs.*` — Values from `workflow_dispatch` inputs
- `needs.*` — Outputs and status from dependent jobs
- `jobs.*` — Job outputs (alternative syntax)
- `steps.*` — Step outputs within custom jobs
- `workflow.*` — Workflow metadata

## Generating Workflows

When generating or editing workflows:

1. Fetch the schema to get current job types, parameters, and allowed values
2. Validate that required fields are present for each job type
3. Verify job references in `needs` and `after` exist in the workflow
4. Check that expressions reference valid contexts and outputs
5. Ensure `if` conditions respect the schema's length constraints

## Validation

After generating or editing a workflow file, validate it against the schema:

```sh
# Install dependencies if missing
[ -d "{baseDir}/scripts/node_modules" ] || npm install --prefix {baseDir}/scripts

node {baseDir}/scripts/validate.js <workflow.yml> [workflow2.yml ...]
```

The validator fetches the latest schema and checks the YAML structure. Fix any reported errors before considering the workflow complete.

## Answering Questions

When users ask about available options (job types, triggers, runner types, etc.), fetch the schema and derive the answer from it rather than relying on potentially outdated information.

## Source File: scripts / fetch.js

``js
#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const CACHE_DIRECTORY = resolve(import.meta.dirname, '.cache');
const DEFAULT_TTL_SECONDS = 15 * 60; // 15 minutes

export async function fetchCached(url) {
  await mkdir(CACHE_DIRECTORY, { recursive: true });

  const cacheFile = resolve(CACHE_DIRECTORY, hashUrl(url) + '.json');
  const cached = await loadCacheEntry(cacheFile);
  if (cached && cached.expires > Math.floor(Date.now() / 1000)) {
    return cached.data;
  }

  // Make request, with conditional If-None-Match if we have an ETag.
  // Cache-Control: max-age=0 overrides Node's default 'no-cache' to allow 304 responses.
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'max-age=0',
      ...(cached?.etag && { 'If-None-Match': cached.etag }),
    },
  });

  if (response.status === 304 && cached) {
    // Refresh expiration and return cached data
    const entry = { ...cached, expires: getExpires(response.headers) };
    await saveCacheEntry(cacheFile, entry);
    return cached.data;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const etag = response.headers.get('etag');
  const data = await response.text();
  const expires = getExpires(response.headers);

  await saveCacheEntry(cacheFile, { url, etag, expires, data });

  return data;
}

function hashUrl(url) {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

async function loadCacheEntry(cacheFile) {
  try {
    return JSON.parse(await readFile(cacheFile, 'utf-8'));
  } catch {
    return null;
  }
}

async function saveCacheEntry(cacheFile, entry) {
  await writeFile(cacheFile, JSON.stringify(entry, null, 2));
}

function getExpires(headers) {
  const now = Math.floor(Date.now() / 1000);

  // Prefer Cache-Control: max-age
  const maxAgeSeconds = parseMaxAge(headers.get('cache-control'));
  if (maxAgeSeconds != null) {
    return now + maxAgeSeconds;
  }

  // Fall back to Expires header
  const expires = headers.get('expires');
  if (expires) {
    const expiresTime = Date.parse(expires);
    if (!Number.isNaN(expiresTime)) {
      return Math.floor(expiresTime / 1000);
    }
  }

  // Default TTL
  return now + DEFAULT_TTL_SECONDS;
}

function parseMaxAge(cacheControl) {
  if (!cacheControl) {
    return null;
  }
  const match = cacheControl.match(/max-age=(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

if (import.meta.main) {
  const url = process.argv[2];

  if (!url || url === '--help' || url === '-h') {
    console.log(`Usage: fetch <url>

Fetches a URL with HTTP caching (ETags + Cache-Control/Expires).
Default TTL: ${DEFAULT_TTL_SECONDS / 60} minutes.
Cache is stored in: ${CACHE_DIRECTORY}/`);
    process.exit(url ? 0 : 1);
  }

  const data = await fetchCached(url);
  console.log(data);
}
````

## Source File: scripts / package.json

``json
{
  "name": "@expo/cicd-workflows-skill",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
    "js-yaml": "^4.1.0"
  }
}
````

## Source File: scripts / validate.js

``js
#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';

import { fetchCached } from './fetch.js';

const SCHEMA_URL = 'https://api.expo.dev/v2/workflows/schema';

async function fetchSchema() {
  const data = await fetchCached(SCHEMA_URL);
  const body = JSON.parse(data);
  return body.data;
}

function createValidator(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

async function validateFile(validator, filePath) {
  const content = await readFile(filePath, 'utf-8');

  let doc;
  try {
    doc = yaml.load(content);
  } catch (e) {
    return { valid: false, error: `YAML parse error: ${e.message}` };
  }

  const valid = validator(doc);
  if (!valid) {
    return { valid: false, error: formatErrors(validator.errors) };
  }

  return { valid: true };
}

function formatErrors(errors) {
  return errors
    .map((error) => {
      const path = error.instancePath || '(root)';
      const allowed = error.params?.allowedValues?.join(', ');
      return `  ${path}: ${error.message}${allowed ? ` (allowed: ${allowed})` : ''}`;
    })
    .join('\n');
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const files = args.filter((a) => !a.startsWith('-'));

  if (files.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: validate <workflow.yml> [workflow2.yml ...]

Validates EAS workflow YAML files against the official schema.`);
    process.exit(files.length === 0 ? 1 : 0);
  }

  const schema = await fetchSchema();
  const validator = createValidator(schema);

  let hasErrors = false;

  for (const file of files) {
    const filePath = resolve(process.cwd(), file);
    const result = await validateFile(validator, filePath);

    if (result.valid) {
      console.log(`✓ ${file}`);
    } else {
      console.error(`✗ ${file}\n${result.error}`);
      hasErrors = true;
    }
  }

  process.exit(hasErrors ? 1 : 0);
}
````

