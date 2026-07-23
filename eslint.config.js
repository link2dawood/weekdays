import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Build-tooling config files run under Node, not the browser.
    files: ['vite.config.js', 'prerender.js', 'src/cli.js', 'scripts/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Runs in both the browser bundle (client/SSR, via Vite's `define`) and
    // plain Node (prerender.js reads process.env directly) — needs both
    // global sets, not just browser.
    files: ['src/data/seo.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
