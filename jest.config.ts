/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

import type { Config } from "jest";

process.env = Object.assign(process.env, {
  DISABLE_LOGGER: "true",
  ENV: "test",
});

export default async (): Promise<Config> => {
  return {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    coveragePathIgnorePatterns: ["/node_modules/"],
    globalSetup: "<rootDir>/src/database/db-test.setup.ts",
    globalTeardown: "<rootDir>/src/database/db-test.teardown.ts",
  };
};
