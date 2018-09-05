module.exports = {
  "roots": [
    "<rootDir>/dist"
  ],
  "testRegex": "(/__test__/.*|(\\.|/)(test|spec))\\.js$",
  "moduleFileExtensions": [
    "js",
    "jsx",
    "json",
    "node"
  ],
  "globals": {
    "ts-jest": {
      "tsConfigFile": "tsconfig.test.json"
    }
  }
};