// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
   {
      // Линтим только исходники src/*.ts. Конфиг и Node-скрипты (seed/smoke/...) —
      // обычный ESM вне tsconfig, type-aware парсер по ним падает.
      ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.mjs', 'scripts/**'],
   },
   eslint.configs.recommended,
   ...tseslint.configs.recommended,
   eslintPluginPrettierRecommended,
   {
      languageOptions: {
         globals: {
            ...globals.node,
            ...globals.jest,
         },
         sourceType: 'commonjs',
         parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
         },
      },
   },
   {
      rules: {
         '@typescript-eslint/no-explicit-any': 'off',
         '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
         '@typescript-eslint/no-floating-promises': 'warn',
         '@typescript-eslint/no-unsafe-argument': 'off',
         'prettier/prettier': ['warn', { singleQuote: true, semi: true }],
      },
   },
);
