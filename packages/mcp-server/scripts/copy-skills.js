// Build-time script: copy platform skill files into dist/skills
// so the MCP server can resolve them from its own package directory
// regardless of monorepo vs npm-install location.
//
// Source: docs/reference/agent/platform-skills/ + platform-skill-routing.md
// Target: packages/mcp-server/dist/skills/

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const SRC_AGENT = path.resolve(ROOT, "docs", "reference", "agent");
const TARGET = path.resolve(__dirname, "..", "dist", "skills");

// Clean target
if (fs.existsSync(TARGET)) {
  fs.rmSync(TARGET, { recursive: true, force: true });
}

fs.mkdirSync(TARGET, { recursive: true });

// Copy platform-skills/ subtree
const srcSkills = path.join(SRC_AGENT, "platform-skills");
const dstSkills = path.join(TARGET, "platform-skills");

if (fs.existsSync(srcSkills)) {
  fs.cpSync(srcSkills, dstSkills, { recursive: true });
  const files = countFiles(dstSkills);
  process.stdout.write(
    `[copy-skills] copied platform-skills/ → dist/skills/platform-skills/ (${files} files)\n`
  );
} else {
  process.stderr.write(`[copy-skills] WARNING: ${srcSkills} not found\n`);
}

// Copy platform-skill-routing.md
const srcRouting = path.join(SRC_AGENT, "platform-skill-routing.md");
const dstRouting = path.join(TARGET, "platform-skill-routing.md");

if (fs.existsSync(srcRouting)) {
  fs.copyFileSync(srcRouting, dstRouting);
  process.stdout.write(
    `[copy-skills] copied platform-skill-routing.md → dist/skills/\n`
  );
} else {
  process.stderr.write(`[copy-skills] WARNING: ${srcRouting} not found\n`);
}

// Copy platform-skill-mcp-surface.md (also referenced)
const srcMcpSurface = path.join(SRC_AGENT, "platform-skill-mcp-surface.md");
const dstMcpSurface = path.join(TARGET, "platform-skill-mcp-surface.md");

if (fs.existsSync(srcMcpSurface)) {
  fs.copyFileSync(srcMcpSurface, dstMcpSurface);
  process.stdout.write(
    `[copy-skills] copied platform-skill-mcp-surface.md → dist/skills/\n`
  );
}

process.stdout.write(`[copy-skills] done\n`);

function countFiles(dir) {
  let count = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        stack.push(path.join(current, entry.name));
      } else if (entry.isFile()) {
        count++;
      }
    }
  }
  return count;
}
