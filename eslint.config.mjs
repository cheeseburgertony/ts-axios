import globals from "globals";
import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

/** @type {import('eslint').Linter.Config[]} */
export default [
	// Node.js JavaScript 文件配置（examples、配置文件等）
	{
		files: [
			"examples/**/*.js",
			"*.config.js",
			"webpack.config.js",
			"rollup.config.js"
		],
		languageOptions: {
			globals: { ...globals.node },
			sourceType: "module",
			ecmaVersion: 2020
		},
		rules: {
			...pluginJs.configs.recommended.rules,
			"no-unused-expressions": "off",
			"no-undef": "off",
			"no-constant-condition": "off"
		}
	},
	// 浏览器端 JavaScript 文件配置
	{
		files: ["**/*.{js,mjs}"],
		ignores: ["examples/**/*.js", "*.config.js", "webpack.config.js"],
		languageOptions: {
			globals: { ...globals.browser },
			sourceType: "module" // ES 模块
		},
		rules: {
			...pluginJs.configs.recommended.rules,
			"no-unused-expressions": "off",
			"no-undef": "off",
			"no-constant-condition": "off"
		}
	},
	// TypeScript 文件配置
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: {
			"@typescript-eslint": tsPlugin
		},
		rules: {
			...pluginJs.configs.recommended.rules,
			...tsPlugin.configs.recommended.rules,
			"@typescript-eslint/no-unnecessary-try-catch": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"no-unused-expressions": "off",
			"no-undef": "off",
			"no-constant-condition": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/prefer-ts-expect-error": "off"
		}
	},
	// TypeScript 测试文件配置
	{
		files: ["__tests__/**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			globals: { ...globals.browser, ...globals.node, ...globals.jest }
		},
		plugins: {
			"@typescript-eslint": tsPlugin
		},
		rules: {
			...pluginJs.configs.recommended.rules,
			...tsPlugin.configs.recommended.rules,
			"@typescript-eslint/no-unnecessary-try-catch": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"no-unused-expressions": "off",
			"no-undef": "off",
			"no-constant-condition": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/prefer-ts-expect-error": "off"
		}
	}
];
