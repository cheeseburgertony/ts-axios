const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const cookieParser = require("cookie-parser");
const multipart = require("connect-multiparty");
const path = require("path");
const WebpackConfig = require("./webpack.config");

require("./server2");

const app = express();
const compiler = webpack(WebpackConfig);
const router = express.Router();

/**
 * 使用 webpack-dev-middleware
 * - 将 webpack 构建的结果保存在内存中，而不是输出到磁盘
 * - 拦截对构建文件的请求，并返回内存中的最新结果
 */
app.use(
	webpackDevMiddleware(compiler, {
		publicPath: "/__build__/", // 构建文件的公共访问路径（需与 webpack.config.js 中保持一致）
		stats: {
			colors: true, // 输出带颜色的日志
			chunks: false // 不显示每个 chunk 的详细信息
		}
	})
);

/**
 * 使用 webpack-hot-middleware
 * - 监听代码变化，触发热更新（HMR）
 * - 无需刷新浏览器即可加载最新的模块
 */
app.use(webpackHotMiddleware(compiler));

/**
 * 提供静态资源服务
 * - 直接访问当前目录下的静态文件（如 HTML）
 */
// app.use(express.static(__dirname));
app.use(
	express.static(__dirname, {
		setHeaders(res) {
			res.cookie("XSRF-TOKEN-D", "1234abc");
		}
	})
);

/**
 * 解析请求体
 * - express.json() 解析 JSON 格式请求体
 * - express.urlencoded() 解析 URL-encoded 格式请求体
 *   （application/x-www-form-urlencoded）
 * - 相当于原来的 body-parser.json() 和 body-parser.urlencoded()
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * 定义路由
 */
const registerSimpleRouter = () => {
	router.get("/simple/get", (req, res) => {
		res.json({ msg: `hello world` });
	});
};

const registerBaseRouter = () => {
	router.get("/base/get", (req, res) => {
		res.json(req.query);
	});

	router.post("/base/post", (req, res) => {
		res.json(req.body);
	});

	router.post("/base/buffer", (req, res) => {
		let msg = [];
		req.on("data", (chunk) => {
			if (chunk) {
				msg.push(chunk);
			}
		});
		req.on("end", () => {
			let buf = Buffer.concat(msg);
			res.json(buf.toJSON());
		});
	});
};

const registerErrorRouter = () => {
	router.get("/error/get", function (req, res) {
		if (Math.random() > 0.5) {
			res.json({
				msg: `hello world`
			});
		} else {
			res.status(500);
			res.end();
		}
	});

	router.get("/error/timeout", function (req, res) {
		setTimeout(() => {
			res.json({
				msg: `hello world`
			});
		}, 3000);
	});
};

const registerExtendRouter = () => {
	router.get("/extend/get", function (req, res) {
		res.end();
	});

	router.options("/extend/options", function (req, res) {
		res.end();
	});

	router.delete("/extend/delete", function (req, res) {
		res.end();
	});

	router.head("/extend/head", function (req, res) {
		res.end();
	});

	router.post("/extend/post", function (req, res) {
		res.json(req.body);
	});

	router.put("/extend/put", function (req, res) {
		res.json(req.body);
	});

	router.patch("/extend/patch", function (req, res) {
		res.json(req.body);
	});

	router.get("/extend/user", function (req, res) {
		res.json({
			code: 0,
			message: "ok",
			result: {
				name: "jack",
				age: 18
			}
		});
	});
};

const registerInterceptorRouter = () => {
	router.get("/interceptor/get", function (req, res) {
		res.end("hello");
	});
};

const registerConfigRouter = () => {
	router.post("/config/post", function (req, res) {
		res.json(req.body);
	});
};

const registerCancelRouter = () => {
	router.get("/cancel/get", (req, res) => {
		setTimeout(() => {
			res.json("hello");
		}, 1000);
	});
	router.post("/cancel/post", (req, res) => {
		setTimeout(() => {
			res.json(req.body);
		}, 1000);
	});
};

const registerMoreRouter = () => {
	router.get("/more/get", (req, res) => {
		res.json(req.cookies);
	});

	app.use(
		multipart({
			uploadDir: path.resolve(__dirname, "upload-file")
		})
	);

	router.post("/more/upload", function (req, res) {
		console.log(req.body, req.files);
		res.end("upload success!");
	});
};

/**
 * 注册路由
 */
registerSimpleRouter();
registerBaseRouter();
registerErrorRouter();
registerExtendRouter();
registerInterceptorRouter();
registerConfigRouter();
registerCancelRouter();
registerMoreRouter();

app.use(router);

/**
 * 启动服务器
 * - 默认端口 8080
 * - 支持自定义 PORT 环境变量
 */
const port = process.env.PORT || 8081;
module.exports = app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`);
});
