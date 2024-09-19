module.exports = {
  root: true,
  extends: [
    '@react-native-community', // React Native's default ESLint config
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all', // Additional rules for React Native
    'plugin:prettier/recommended', // Prettier integration
  ],
  plugins: ['react', 'react-native', 'import'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true, // Enable JSX parsing
    },
    ecmaVersion: 2020, // ES2020+ support
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    'react-native/react-native': true, // Enables React Native environment
  },
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }], // Prettier formatting rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Disable prop-types rule if using TypeScript
    'no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ], // Ignore variables prefixed with _
    'import/no-unused-modules': [1, { unusedExports: true }], // Unused imports detection
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external', 'internal']],
        'newlines-between': 'always',
      },
    ], // Organize imports
    'react-native/no-inline-styles': 'off', // Turn off no-inline-styles rule
    'react-native/split-platform-components': 2, // Ensure platform-specific components are used correctly
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'], // Resolve for React Native extensions
      },
    },
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // Apply TypeScript-specific rules
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
};
