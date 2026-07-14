import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  // 全局忽略
  {
    ignores: [
      '**/node_modules/**',
      '**/.vite/**',
      '**/out/**',
      '**/dist/**',
      '**/.temp/**',
      'states-*.html',
      '**/.vscode/**',
      '**/.github/**',
    ],
  },

  // js 基础配置
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
    },
  },

  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/common/utils.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prefer-rest-params': 'off',
    },
  },

  // 用于 Vue 文件
  ...pluginVue.configs['flat/strongly-recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
    },
  },

  // Prettier 配置（必须放在最后，用于禁用与 Prettier 冲突的规则）
  prettier,
];
