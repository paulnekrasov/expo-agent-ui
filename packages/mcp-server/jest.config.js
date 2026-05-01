const path = require("path");

module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/**/*.test.js"],
  moduleNameMapper: {
    "^@agent-ui/core$":
      path.resolve(__dirname, "../core/dist/bridge.js"),
    "^react-native$": "<rootDir>/test/__mocks__/react-stub.js",
    "^react$": "<rootDir>/test/__mocks__/react-stub.js",
    "^react/jsx-runtime$": "<rootDir>/test/__mocks__/react-stub.js"
  }
};
