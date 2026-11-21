import stylistic from '@stylistic/eslint-plugin';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // As before the move to flat config, only the TypeScript sources are linted: the JS dev tools
  // (scripts/), the JS configs and the brainstorm sketches are not.
  globalIgnores([
    '.next/**',
    'dist/**',
    'node_modules/**',
    '.superpowers/**',
    'next-env.d.ts',
    '**/*.{js,cjs,mjs}',
  ]),
  {
    // The files next's configs register the react, react-hooks and jsx-a11y plugins for.
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    plugins: { '@stylistic': stylistic },
    rules: {
      // JS
      'prefer-const': 'error',
      curly: ['error', 'all'],
      'no-console': 'error',
      'no-redeclare': ['error', { builtinGlobals: true }],
      'arrow-body-style': 'off',

      // Formatting
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/max-len': ['error', {
        code: 100,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
      }],
      '@stylistic/operator-linebreak': ['error', 'before'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],

      // React
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/destructuring-assignment': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
      'react/state-in-constructor': ['error', 'never'],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      // React Compiler checks from eslint-plugin-react-hooks 7. The site does not use the
      // compiler, and the R3F scene code mutates three.js uniforms and refs by design.
      'react-hooks/static-components': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/unsupported-syntax': 'off',
      'react-hooks/config': 'off',
      'react-hooks/gating': 'off',
      'jsx-a11y/label-has-associated-control': 'off',

      // TypeScript
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      // The old config allowed `{}` as a type.
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    // react-three-fiber JSX uses three.js props (args, attach, uniforms, ...)
    files: ['src/components/Hero/**/*.tsx', 'src/components/Wine/**/*.tsx'],
    rules: {
      'react/no-unknown-property': 'off',
    },
  },
]);
