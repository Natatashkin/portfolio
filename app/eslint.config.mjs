import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Strict TypeScript.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          args: 'none',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_'
        }
      ],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: true, classes: true, variables: true }
      ],
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: false,
          allowTernary: false,
          allowTaggedTemplates: false,
          enforceForJSX: false
        }
      ],

      // General style.
      'no-console': 'warn',
      'no-cond-assign': ['error', 'always'],
      'arrow-body-style': ['error', 'as-needed'],

      // React.
      'react/self-closing-comp': 'warn',
      'react/jsx-curly-brace-presence': [
        'warn',
        { props: 'never', children: 'never' }
      ],

      // Imports: alias over parent paths, sorted groups, sorted members.
      // import/no-duplicates instead of the core rule, so `import type` can stay separate.
      'import/no-duplicates': 'error',
      'no-restricted-imports': ['error', { patterns: ['../*'] }],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true
        }
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index']
          ],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'next{,/**}', group: 'external', position: 'before' },
            { pattern: '@/**', group: 'internal' }
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ]
    }
  },
  {
    // Messages live outside src/, so the i18n config has to reach them with a parent path.
    files: ['src/i18n/**'],
    rules: { 'no-restricted-imports': 'off' }
  },
  {
    // Node scripts print their results and import shared code from src/ by relative path.
    files: ['scripts/**'],
    rules: { 'no-console': 'off', 'no-restricted-imports': 'off' }
  },
  // Must stay last: turns off rules that conflict with Prettier.
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])
]);

export default eslintConfig;
