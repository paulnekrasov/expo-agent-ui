const assert = require("node:assert/strict");

const distPlugin = require("../dist/index.js");
const appPlugin = require("../app.plugin.js");

const baseConfig = {
  name: "Example",
  slug: "example",
  extra: {
    enabled: true
  }
};

const result = distPlugin.withAgentUI(baseConfig, { enabled: true });

assert.equal(result, baseConfig, "withAgentUI should preserve the config reference");
assert.deepEqual(result, baseConfig, "withAgentUI should not mutate the config shell");
assert.equal(distPlugin.default, distPlugin.withAgentUI, "default export should match the named export");
assert.equal(appPlugin, distPlugin.withAgentUI, "app.plugin.js should forward the plugin function");

process.stdout.write("expo-plugin smoke tests passed\n");
