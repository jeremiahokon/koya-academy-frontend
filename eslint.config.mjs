import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import playwrightPlugin from 'eslint-plugin-playwright';
import tseslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  // Base JS config
  js.configs.recommended,

  // Next.js configs (includes React, React Hooks, jsx-a11y, and Next.js rules)
  ...nextVitals,
  ...nextTs,

  // Override/extend React rules from Next.js config
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
      'react/self-closing-comp': ['error', { component: true, html: true }],
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Next.js custom rules
      '@next/next/no-img-element': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-duplicate-head': 'off',
      
      // Accessibility rules (jsx-a11y is already included in nextVitals)
      'jsx-a11y/alt-text': 'off', // Handled by Next.js Image component
      'jsx-a11y/heading-has-content': 'off', // Allow empty headings
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
    },
  },

  // Simple import sort config
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. `react` and `next` related packages come first
            ['^react(-|\\/|$)', '^next(-|\\/|$)', '^@next(-|\\/|$)'],
            // 2. Other third-party packages
            ['^@?\\w'],
            // 3. `@ui` imports
            ['^@ui(-|\\/|$)'],
            // 4. `@/components` imports
            ['^@/components'],
            // 5. `@/app` imports
            ['^@/app'],
            // 6. `@/store` imports
            ['^@/store'],
            // 7. `@/lib` imports
            ['^@/lib'],
            // 8. `@assets` imports
            ['^@assets(-|\\/|$)'],
            // 9. Other absolute imports
            ['^@/'],
            // 10. Relative imports
            ['^\\.'],
            // 11. Style imports
            ['^.+\\.s?css$'],
            // 12. Side effect imports
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'sort-imports': 'off',
      'import/order': 'off',
    },
  },

  // Unicorn plugin for additional best practices
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
            camelCase: true,
          },
        },
      ],
      'unicorn/no-nested-ternary': 'error',
      'unicorn/consistent-destructuring': 'error',
      'unicorn/prefer-at': 'off',
      'unicorn/prefer-code-point': 'off',
    },
  },

  // TypeScript specific rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },

  // Code style and readability rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'lines-around-comment': [
        'error',
        {
          beforeBlockComment: true,
          beforeLineComment: true,
          allowBlockStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'any',
          prev: 'export',
          next: 'export',
        },
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var'],
          next: '*',
        },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['function', 'multiline-const', 'multiline-block-like'],
        },
        {
          blankLine: 'always',
          prev: ['function', 'multiline-const', 'multiline-block-like'],
          next: '*',
        },
      ],
      'newline-before-return': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'eol-last': ['error', 'never'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': ['error', 'always'],
    },
  },

  // Playwright test files
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      playwright: playwrightPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Special files overrides
  {
    files: ['src/iconify-bundle/*'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Prettier config (must be last to override conflicting rules)
  prettier,

  // Global ignores (override default ignores of eslint-config-next)
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Additional ignores:
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/public/**',
    '**/.git/**',
    '**/.husky/**',
    '**/.vscode/**',
    '**/package-lock.json',
    '**/pnpm-lock.yaml',
  ]),
]);

export default eslintConfig;
