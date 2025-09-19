const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
	mode: "development",

	/**
	 * 在 examples 目录下建多个子目录
	 * 每个子目录下有一个 app.ts 作为入口文件
	 * entries 收集所有入口，并引入热更新客户端
	 */
	entry: fs.readdirSync(__dirname).reduce((entries, dir) => {
		const fullDir = path.join(__dirname, dir);
		const entry = path.join(fullDir, "app.ts");
		if (fs.statSync(fullDir).isDirectory() && fs.existsSync(entry)) {
			entries[dir] = ["webpack-hot-middleware/client", entry];
		}
		return entries;
	}, {}),

	/**
	 * 按目录名称输出构建结果
	 */
	output: {
		path: path.join(__dirname, "__build__"),
		filename: "[name].js",
		publicPath: "/__build__/",
		clean: true // 每次构建清理旧文件
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: "ts-loader",
						options: {
							transpileOnly: true // 提高速度，类型检查交给 fork-ts-checker 或 tsc
						}
					}
				],
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			}
		]
	},

	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},

	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new ESLintPlugin({
			extensions: ["ts", "tsx", "js"],
			emitWarning: true
		})
	],

	devtool: "source-map"
};
