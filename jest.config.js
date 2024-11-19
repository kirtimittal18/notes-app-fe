module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  "testEnvironment": "jsdom",
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  "moduleNameMapper": {
    "\\.css$": "identity-obj-proxy"
  }
};