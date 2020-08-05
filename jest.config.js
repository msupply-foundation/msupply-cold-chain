module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/test-setup.js'],
  transformIgnorePatterns: [],
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
};
