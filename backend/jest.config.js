/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',                   // Use ts-jest to compile TS in tests
  testEnvironment: 'node',              // Use Node test env
  setupFiles: ['<rootDir>/tests/setup/setupTestEnv.ts'],  // Runs before the test framework is installed
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/teardown.ts' // Runs after framework is installed — good for afterAll hooks, matchers etc.
  ]
};
