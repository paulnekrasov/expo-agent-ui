module.exports = {
  moduleNameMapper: {
    "^@expo-agent-ui/core$": "<rootDir>/../core/src/index.ts"
  },
  preset: "jest-expo/android",
  testMatch: ["<rootDir>/app/**/*.test.ts?(x)"]
};
