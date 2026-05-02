#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const skillDir = path.resolve(process.argv[2] || path.join(__dirname, ".."));

if (!fs.existsSync(skillDir)) {
  process.stderr.write(`Skill directory not found: ${skillDir}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Pass counters
// ---------------------------------------------------------------------------
const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

// ---------------------------------------------------------------------------
// 1. Required files
// ---------------------------------------------------------------------------
const requiredFiles = [
  "SKILL.md",
  "references/components.md",
  "references/semantics.md",
  "references/tools.md",
  "references/flows.md",
  "references/patching.md",
  "examples/checkout-screen.tsx",
  "examples/settings-screen.tsx",
  "examples/flow.json",
  "scripts/validate-semantic-ids.js",
];

for (const rf of requiredFiles) {
  const fullPath = path.join(skillDir, rf);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required file: ${rf}`);
  }
}

// ---------------------------------------------------------------------------
// 2. SKILL.md frontmatter
// ---------------------------------------------------------------------------
const skillMdPath = path.join(skillDir, "SKILL.md");
if (fs.existsSync(skillMdPath)) {
  const content = fs.readFileSync(skillMdPath, "utf8");

  if (!content.startsWith("---")) {
    fail("SKILL.md missing YAML frontmatter (must start with ---)");
  } else {
    const endFm = content.indexOf("---", 3);
    if (endFm === -1) {
      fail("SKILL.md YAML frontmatter not closed (missing closing ---)");
    } else {
      const fm = content.substring(4, endFm).trim();

      if (!/^name\s*:\s*\S/m.test(fm)) {
        fail("SKILL.md frontmatter missing 'name' field");
      }
      if (!/^description\s*:\s*>/m.test(fm)) {
        fail("SKILL.md frontmatter missing 'description' field");
      }

      // Progressive disclosure: description should be multi-line (>  style)
      if (!fm.includes("\n  ")) {
        warn("SKILL.md description uses single-line format; prefer progressive-disclosure folded style with >\n");
      }
    }

    // Progressive disclosure: main body must not be too short (empty) or too long
    const bodyStart = content.indexOf("---", 3) + 3;
    const body = content.substring(bodyStart).trim();
    const bodyLines = body.split("\n").length;

    if (bodyLines < 30) {
      fail(`SKILL.md body too short (${bodyLines} lines); must include quickstart, tools table, semantic ID rules, platform skill routing, component table, flow/patch references, and verification`);
    }
    if (bodyLines > 500) {
      warn(`SKILL.md body is ${bodyLines} lines; consider progressive disclosure to references/`);
    }
  }

  // Prohibited patterns — skip lines that are prohibition context
  const prohibited = [
    { pattern: /tree-sitter/i, msg: "references tree-sitter (old parser)" },
    { pattern: /swift[a-z]?[- ]?ui parser/i, msg: "references SwiftUI parser (old project)" },
    { pattern: /swiftui-autonomous-agent-loop/i, msg: "references old automation path" },
    { pattern: /canvas renderer/i, msg: "references Canvas renderer (old project)" },
    { pattern: /vscode extension/i, msg: "references VS Code extension (old project)" },
  ];

  const negationRe = /\bDo\s+NOT\b|\bNEVER\b|\bdo\s+not\b|\bnever\b|\bnon-negotiabl/i;

  for (const { pattern, msg } of prohibited) {
    if (pattern.test(content)) {
      // Check each matching line for negation context
      const lines = content.split("\n");
      let allInNegation = true;
      for (const line of lines) {
        if (pattern.test(line) && !negationRe.test(line)) {
          allInNegation = false;
          break;
        }
      }
      if (!allInNegation) {
        fail(`SKILL.md prohibited pattern: ${msg}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. References must resolve relative links
// ---------------------------------------------------------------------------
if (fs.existsSync(skillMdPath)) {
  const content = fs.readFileSync(skillMdPath, "utf8");
  const linkRE = /\breferences\/\S+\.md\b/g;
  let m;
  while ((m = linkRE.exec(content)) !== null) {
    const linkPath = path.join(skillDir, m[0]);
    if (!fs.existsSync(linkPath)) {
      fail(`SKILL.md broken link: ${m[0]} (file not found)`);
    }
  }

  const exampleRE = /\bexamples\/\S+\b/g;
  while ((m = exampleRE.exec(content)) !== null) {
    const linkPath = path.join(skillDir, m[0]);
    if (!fs.existsSync(linkPath)) {
      fail(`SKILL.md broken link: ${m[0]} (file not found)`);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. flow.json must be valid JSON and match schema shape
// ---------------------------------------------------------------------------
const flowJsonPath = path.join(skillDir, "examples", "flow.json");
if (fs.existsSync(flowJsonPath)) {
  let flow;
  try {
    flow = JSON.parse(fs.readFileSync(flowJsonPath, "utf8"));
  } catch (e) {
    fail(`examples/flow.json is not valid JSON: ${e.message}`);
  }

  if (flow && flow.flow) {
    const f = flow.flow;
    const requiredFlowFields = ["name", "steps"];
    for (const ff of requiredFlowFields) {
      if (!(ff in f)) fail(`flow.json missing required field: flow.${ff}`);
    }
    if (f.steps && !Array.isArray(f.steps)) {
      fail("flow.json flow.steps must be an array");
    }
    if (f.steps && Array.isArray(f.steps) && f.steps.length === 0) {
      fail("flow.json flow.steps is empty; add at least one step");
    }

    const validStepTypes = ["tap", "input", "scroll", "navigate", "waitFor", "assert", "observeEvents"];
    for (let i = 0; i < (f.steps || []).length; i++) {
      const step = f.steps[i];
      if (!step.type) {
        fail(`flow.json step[${i}] missing type`);
      } else if (!validStepTypes.includes(step.type)) {
        fail(`flow.json step[${i}] unknown type "${step.type}"; valid: ${validStepTypes.join(", ")}`);
      }
    }

    // Security: no raw secure values
    const jsonText = fs.readFileSync(flowJsonPath, "utf8");
    if (/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/.test(jsonText)) {
      fail("flow.json may contain raw card numbers; use $FIXTURE references");
    }
    // Check for CVV-like raw numbers (3-4 digit patterns near "cvv" context)
    if (/\b\d{3}\b/.test(jsonText)) {
      // Only flag if it looks like a raw CVV (not inside a $FIXTURE)
      const lines = jsonText.split("\n");
      for (const line of lines) {
        if (/\b\d{3}\b/.test(line) && !line.includes("$") && line.includes("cvv")) {
          fail("flow.json may contain raw CVV values; use $FIXTURE references");
          break;
        }
      }
    }
  } else {
    fail("flow.json missing top-level flow object");
  }

  if (flow && flow.metadata && flow.metadata.requiresApproval) {
    if (!flow.metadata.gatedSteps || flow.metadata.gatedSteps.length === 0) {
      warn("flow.json requiresApproval is true but gatedSteps is empty");
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Progressive disclosure: SKILL.md should reference, not inline large content
// ---------------------------------------------------------------------------
if (fs.existsSync(skillMdPath)) {
  const content = fs.readFileSync(skillMdPath, "utf8");

  // Check that reference files actually have content
  for (const ref of ["components.md", "semantics.md", "tools.md", "flows.md", "patching.md"]) {
    const refPath = path.join(skillDir, "references", ref);
    if (fs.existsSync(refPath)) {
      const refContent = fs.readFileSync(refPath, "utf8");
      if (refContent.trim().length < 200) {
        warn(`references/${ref} is very short (${refContent.trim().length} chars); should be comprehensive`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Example screens must have AgentUIProvider and semantic IDs
// ---------------------------------------------------------------------------
for (const example of ["checkout-screen.tsx", "settings-screen.tsx"]) {
  const exPath = path.join(skillDir, "examples", example);
  if (!fs.existsSync(exPath)) continue;

  const exContent = fs.readFileSync(exPath, "utf8");

  if (!exContent.includes("AgentUIProvider")) {
    // Settings screen is designed to be wrapped by parent; not an error
    if (!example.includes("settings")) {
      warn(`examples/${example} does not include AgentUIProvider wrapper`);
    }
  }

  // Check for actionable nodes with IDs
  const idRE = /\bid\s*=\s*["']/g;
  const idMatches = exContent.match(idRE);
  if (!idMatches || idMatches.length < 2) {
    warn(`examples/${example} has fewer than 2 semantic ID props; actionable nodes need stable IDs`);
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
process.stdout.write(`Validating Expo Agent UI skill at ${skillDir}\n\n`);

for (const e of errors) {
  process.stdout.write(`ERROR: ${e}\n`);
}
for (const w of warnings) {
  process.stdout.write(`WARN:  ${w}\n`);
}

process.stdout.write(
  `\nResults: ${errors.length} errors, ${warnings.length} warnings\n`
);

process.exit(errors.length > 0 ? 1 : 0);
