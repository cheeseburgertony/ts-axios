import globals from "globals";
import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json", // 添加这行启用类型检查
            },
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
            "@typescript-eslint/no-unused-vars": "off",
            "no-unused-expressions": "off",
            "no-undef": "off",
            "no-constant-condition": "off"
        }
    }
];