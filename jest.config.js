module.exports = {
  preset: 'react-native',
  setupFiles: [
    '<rootDir>/test-setup.js',
    './node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(jest-)?react-native|@react-native-community|@react-navigation|typeorm)',
  ],
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
};
