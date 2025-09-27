import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

const libraryName = "axios";

const toCamelCase = (str) => {
	return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

export default {
	input: `src/${libraryName}.ts`,
	// 输出配置
	output: [
		{
			file: pkg.main,
			name: toCamelCase(libraryName),
			format: "umd",
			sourcemap: true
		},
		{ file: pkg.module, format: "es", sourcemap: true }
	],
	// 排除不需要打包的依赖
	external: [],
	watch: {
		include: "src/**"
	},
	plugins: [
		// JSON文件解析
		json(),
		// TypeScript 编译
		typescript({ useTsconfigDeclarationDir: true }),
		// CommonJS 转换
		commonjs(),
		// Node 模块解析
		resolve()
	]
};
