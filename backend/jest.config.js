/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // 👈 This resolves @/ alias to /src
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
