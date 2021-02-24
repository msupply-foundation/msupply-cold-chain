module.exports = {
  extends: [
    'airbnb',
    'prettier',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended',
  ],
  settings: {
    'import/resolver': {
      'babel-module': {
        alias: require('./paths.json'),
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    useJSXTextNode: true,
    project: './tsconfig.json',
    tsconfigRootDir: '.',
  },

  env: {
    jest: true,
  },
  rules: {
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'comma-dangle': 'off',
    'react/boolean-prop-naming': ['error', { rule: '^(is)[A-Z]([A-Za-z0-9]?)+' }],
    'react/default-props-match-prop-types': 'error',
    'import/prefer-default-export': 'off',
    'operator-linebreak': 'off',
    'global-require': 'off',
    'object-curly-newline': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['draftState'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    // note you must disable the base rule as it can report incorrect errors
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-empty-function': 'off',
  },
  globals: {
    fetch: false,
    __DEV__: true,
  },
};
