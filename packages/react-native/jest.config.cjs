/** @type {import("@jest/types").Config.InitialOptions} */
module.exports = {
  preset: "react-native",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
          strict: true,
          strictNullChecks: true,
        },
      },
    ],
    "^.+\\.jsx?$": "babel-jest",
  },
  testMatch: ["<rootDir>/src/__tests__/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transformIgnorePatterns: [
    "<rootDir>/../../node_modules/(?!(@react-native|react-native|@entropix)/)",
    "<rootDir>/../../node_modules/.pnpm/(?!(@react-native\\+|react-native@|@entropix\\+))",
  ],
};
