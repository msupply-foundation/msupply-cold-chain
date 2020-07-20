module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['react-require'],
    [
      'module-resolver',
      {
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        root: ['.'],
        alias: {
          '~storybook': './src/view/storybook',
        },
      },
    ],
  ],
};
