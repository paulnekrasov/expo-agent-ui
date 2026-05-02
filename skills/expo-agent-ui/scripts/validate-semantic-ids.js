#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const targetDir = path.resolve(process.argv[2] || "./app/");

if (!fs.existsSync(targetDir)) {
  process.stderr.write(`Directory not found: ${targetDir}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function walk(dir, extensions) {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath, extensions));
    } else if (extensions.some((ext) => fullPath.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function lineNumber(content, offset) {
  return (content.substring(0, offset).match(/\n/g) || []).length + 1;
}

// Matches id prop values across the three quoting styles JSX supports.
// Without 'g' flag — used for single-match extraction.
const ID_VALUE_RE = /id\s*=\s*(?:"([^"]+)"|'([^']+)'|\{["']([^"']+)["']\})/;
// With 'g' flag — used for iterating all matches in a file.
const ID_VALUE_RE_G = /id\s*=\s*(?:"([^"]+)"|'([^']+)'|\{["']([^"']+)["']\})/g;

function extractId(tagContent) {
  const m = tagContent.match(ID_VALUE_RE);
  if (!m) return null;
  // Re-exec to get capture groups.
  const cg = ID_VALUE_RE.exec(tagContent);
  if (!cg) return null;
  return { value: cg[1] || cg[2] || cg[3] };
}

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------
const ACTIONABLE = [
  "Button",
  "TextField",
  "SecureField",
  "Toggle",
  "Slider",
  "Picker",
  "Stepper",
];

const files = walk(targetDir, [".tsx", ".ts"]);
const errors = [];
const warnings = [];
const allEntries = []; // { id, file, line, component }

// Regex to find opening tags of actionable components.
const actionableTagRE = new RegExp(
  `<\\s*(${ACTIONABLE.join("|")})\\b`,
  "g"
);

for (const file of files) {
  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  // -- Phase 1: actionable component id check --
  let m;
  while ((m = actionableTagRE.exec(content)) !== null) {
    const component = m[1];
    const startOffset = m.index;
    const endOffset = content.indexOf(">", startOffset);
    if (endOffset === -1) continue;

    const tagContent = content.substring(startOffset, endOffset + 1);
    const extracted = extractId(tagContent);

    if (!extracted) {
      const ln = lineNumber(content, startOffset);
      errors.push({
        file,
        line: ln,
        component,
        msg: `${component} missing required id prop`,
      });
    } else {
      // Find the actual file position of the id= prop to compute the
      // correct line.  This ensures our line matches what Phase 2 records
      // so deduplication works for multiline JSX.
      const idPos = tagContent.search(/\bid\s*=/);
      const absPos =
        idPos >= 0
          ? startOffset + idPos
          : startOffset + tagContent.indexOf(extracted.value);
      const ln = lineNumber(content, absPos);

      allEntries.push({
        id: extracted.value,
        file,
        line: ln,
        component,
      });
    }
  }

  // -- Phase 2: all id props (for duplicate / convention checks) --
  ID_VALUE_RE_G.lastIndex = 0;
  while ((m = ID_VALUE_RE_G.exec(content)) !== null) {
    const idValue = m[1] || m[2] || m[3];
    const ln = lineNumber(content, m.index);

    // Skip ids already captured by Phase 1 on the same line.
    const alreadyTracked = allEntries.some(
      (e) => e.id === idValue && e.file === file && e.line === ln
    );
    if (!alreadyTracked) {
      allEntries.push({ id: idValue, file, line: ln, component: null });
    }
  }
}

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

// Rule: duplicate IDs
const idMap = {};
for (const entry of allEntries) {
  if (!idMap[entry.id]) {
    idMap[entry.id] = [];
  }
  idMap[entry.id].push(entry);
}
for (const [id, entries] of Object.entries(idMap)) {
  if (entries.length > 1) {
    for (let i = 1; i < entries.length; i++) {
      const first = entries[0];
      warnings.push({
        file: entries[i].file,
        line: entries[i].line,
        msg: `duplicate id '${id}' (also in ${first.file}:${first.line})`,
      });
    }
  }
}

// Rule: IDs must be lowercase dot-separated
const dotSepRE = /^[a-z0-9]+(\.[a-z0-9]+)*$/;

// Track unique (id, file, line) tuples to avoid emitting duplicate warnings
// for entries that were collected twice (Phase 1 + Phase 2 on different lines
// in multiline JSX).
const warnedKey = new Set();

function warnKey(entry) {
  return `${entry.file}:${entry.line}:${entry.id}`;
}

for (const entry of allEntries) {
  const key = warnKey(entry);

  // spaces check
  if (/\s/.test(entry.id) && !warnedKey.has(key + ":space")) {
    warnings.push({
      file: entry.file,
      line: entry.line,
      msg: `id '${entry.id}' contains spaces`,
    });
    warnedKey.add(key + ":space");
  }

  // convention check
  if (!dotSepRE.test(entry.id) && !warnedKey.has(key + ":convention")) {
    warnings.push({
      file: entry.file,
      line: entry.line,
      msg: `id '${entry.id}' should follow lowercase dot-separated convention`,
    });
    warnedKey.add(key + ":convention");
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
const relDir = path.relative(process.cwd(), targetDir) || targetDir;

process.stdout.write(`Validating semantic IDs in ${relDir}...\n\n`);

for (const e of errors) {
  process.stdout.write(`ERROR: ${e.file}:${e.line}: ${e.msg}\n`);
}
for (const w of warnings) {
  process.stdout.write(`WARN:  ${w.file}:${w.line}: ${w.msg}\n`);
}

process.stdout.write(
  `\nResults: ${errors.length} errors, ${warnings.length} warnings\n`
);

process.exit(errors.length > 0 ? 1 : 0);
