/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom', 
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/test/",
    "/build/"
  ]
};