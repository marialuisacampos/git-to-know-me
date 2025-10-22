const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "contexts/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jose|openid-client|next-auth|@panva|@octokit|universal-user-agent|before-after-hook)/)",
  ],
};

module.exports = createJestConfig(customJestConfig);
