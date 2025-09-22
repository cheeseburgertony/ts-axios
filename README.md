# ts-axios

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

一个基于 TypeScript 重新实现的 Axios HTTP 客户端库，提供完整的类型支持和现代化的开发体验。

## 特性

- 🚀 **完整 TypeScript 支持** - 提供完整的类型定义和智能提示
- 📦 **多种打包格式** - 支持 UMD 和 ES Module 两种格式
- 🧪 **完整测试覆盖** - 使用 Jest 进行单元测试，覆盖率 > 90%
- 📚 **自动化文档** - 使用 TypeDoc 生成完整的 API 文档
- 🔧 **现代化工具链** - ESLint、Prettier、Husky、Commitlint 等
- 🎯 **请求/响应拦截器** - 灵活的请求和响应处理机制
- ❌ **请求取消** - 支持取消正在进行的 HTTP 请求
- 🍪 **Cookie 支持** - 自动处理浏览器 Cookie
- 🔐 **XSRF 防护** - 内置 CSRF 攻击保护
- 📈 **上传进度** - 支持文件上传和下载进度监控
- 🌐 **完整的 HTTP 方法** - 支持 GET、POST、PUT、DELETE、PATCH 等
- ⚙️ **灵活配置** - 支持全局和实例级别的配置
- 🔄 **请求/响应转换** - 内置数据转换器，支持 JSON、FormData 等

## 安装

```bash
npm install tony-axios
```

## 快速开始

### 基本用法

```typescript
import axios from "tony-axios";

// 发送 GET 请求
axios.get("/api/users").then((response) => {
	console.log(response.data);
});

// 发送 POST 请求
axios
	.post("/api/users", {
		name: "John Doe",
		email: "john@example.com"
	})
	.then((response) => {
		console.log("User created:", response.data);
	});

// 使用 async/await
async function getUsers() {
	try {
		const response = await axios.get("/api/users");
		return response.data;
	} catch (error) {
		console.error("Failed to get users:", error);
	}
}
```

### 创建实例

```typescript
const api = axios.create({
	baseURL: "https://api.example.com",
	timeout: 5000,
	headers: {
		Authorization: "Bearer your-token-here",
		"Content-Type": "application/json"
	}
});

// 使用实例发送请求
api.get("/users").then((response) => {
	console.log(response.data);
});
```

### 请求和响应拦截器

```typescript
// 添加请求拦截器
axios.interceptors.request.use(
	(config) => {
		// 在发送请求之前做些什么
		console.log("Sending request:", config);
		config.headers.Authorization = `Bearer ${getAuthToken()}`;
		return config;
	},
	(error) => {
		// 对请求错误做些什么
		return Promise.reject(error);
	}
);

// 添加响应拦截器
axios.interceptors.response.use(
	(response) => {
		// 对响应数据做点什么
		console.log("Response received:", response);
		return response;
	},
	(error) => {
		// 对响应错误做点什么
		if (error.response?.status === 401) {
			// 处理未授权错误
			redirectToLogin();
		}
		return Promise.reject(error);
	}
);
```

### 取消请求

```typescript
import { CancelToken } from "tony-axios";

const source = CancelToken.source();

axios
	.get("/api/data", {
		cancelToken: source.token
	})
	.catch((thrown) => {
		if (axios.isCancel(thrown)) {
			console.log("Request canceled:", thrown.message);
		} else {
			console.error("Request failed:", thrown);
		}
	});

// 取消请求（可以提供一个可选的消息）
source.cancel("Operation canceled by the user.");
```

### 文件上传

```typescript
// 使用 FormData 上传文件
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("name", "my-file");

axios.post("/api/upload", formData, {
	headers: {
		"Content-Type": "multipart/form-data"
	},
	onUploadProgress: (progressEvent) => {
		const percentCompleted = Math.round(
			(progressEvent.loaded * 100) / progressEvent.total
		);
		console.log(`Upload Progress: ${percentCompleted}%`);
	}
});
```

### 配置选项

```typescript
// 全局默认配置
axios.defaults.baseURL = "https://api.example.com";
axios.defaults.headers.common["Authorization"] = "Bearer token";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.timeout = 10000;

// 完整的请求配置选项
const config = {
	// 基础 URL，会自动加在 `url` 前面，除非 `url` 是绝对路径
	baseURL: "https://api.example.com",

	// 请求的 URL
	url: "/users",

	// 请求方法
	method: "get", // 默认值

	// 请求头
	headers: {
		"Content-Type": "application/json"
	},

	// URL 参数
	params: {
		page: 1,
		limit: 10
	},

	// 请求体数据
	data: {
		name: "John",
		email: "john@example.com"
	},

	// 超时时间（毫秒）
	timeout: 5000,

	// 跨域请求时是否携带凭证
	withCredentials: false,

	// 响应数据类型
	responseType: "json", // 可选: 'json', 'text', 'blob', 'arraybuffer'

	// XSRF 设置
	xsrfCookieName: "XSRF-TOKEN",
	xsrfHeaderName: "X-XSRF-TOKEN",

	// 上传进度回调
	onUploadProgress: (progressEvent) => {
		console.log("Upload progress:", progressEvent);
	},

	// 下载进度回调
	onDownloadProgress: (progressEvent) => {
		console.log("Download progress:", progressEvent);
	},

	// 取消令牌
	cancelToken: source.token
};

axios(config).then((response) => {
	console.log(response.data);
});
```

### 错误处理

```typescript
axios.get("/api/users").catch((error) => {
	if (error.response) {
		// 服务器响应了状态码，但状态码不在 2xx 范围内
		console.log("Response data:", error.response.data);
		console.log("Response status:", error.response.status);
		console.log("Response headers:", error.response.headers);

		if (error.response.status === 404) {
			console.log("Resource not found");
		} else if (error.response.status === 500) {
			console.log("Server error");
		}
	} else if (error.request) {
		// 请求已发出，但没有收到响应
		console.log("No response received:", error.request);
	} else {
		// 其他错误（请求配置错误等）
		console.log("Error:", error.message);
	}
});
```

### HTTP 方法别名

```typescript
// 支持所有常用的 HTTP 方法
axios.get(url[, config])
axios.delete(url[, config])
axios.head(url[, config])
axios.options(url[, config])
axios.post(url[, data[, config]])
axios.put(url[, data[, config]])
axios.patch(url[, data[, config]])
```

## 开发

### 环境要求

- Node.js >= 6.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动开发服务器，在浏览器中打开 `http://localhost:8080` 查看示例。

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:prod
```

### 构建

```bash
npm run build
```

构建后的文件会生成在 `dist` 目录中：

- `dist/axios.umd.js` - UMD 格式，可直接在浏览器中使用
- `dist/axios.es5.js` - ES Module 格式
- `dist/types/` - TypeScript 类型定义文件

### 代码检查和格式化

```bash
# 运行 ESLint 检查并自动修复
npm run lint

# 格式化代码（通过 Prettier）
npm run prettier
```

### 提交代码

项目使用 [Conventional Commits](https://conventionalcommits.org/) 规范和 Husky 进行 Git 钩子管理：

```bash
# 使用交互式提交
npm run commit

# 或手动提交（需要遵循规范）
git commit -m "feat: add new feature"
```

### 发布新版本

```bash
npm run pub
```

此命令会：

1. 运行测试
2. 构建项目
3. 更新版本号
4. 创建 Git 标签
5. 发布到 npm

## 项目结构

```
ts-axios/
├── src/                    # 源代码
│   ├── core/              # 核心功能
│   │   ├── Axios.ts       # Axios 类
│   │   ├── dispatchRequest.ts
│   │   ├── InterceptorManager.ts
│   │   ├── mergeConfig.ts
│   │   ├── transform.ts
│   │   └── xhr.ts
│   ├── cancel/            # 请求取消功能
│   │   ├── Cancel.ts
│   │   └── CancelToken.ts
│   ├── helper/            # 工具函数
│   │   ├── cookie.ts
│   │   ├── data.ts
│   │   ├── error.ts
│   │   ├── headers.ts
│   │   ├── url.ts
│   │   └── util.ts
│   ├── types/             # 类型定义
│   │   └── index.ts
│   ├── axios.ts           # 主入口
│   ├── defaults.ts        # 默认配置
│   └── index.ts
├── __tests__/             # 测试文件
├── examples/              # 示例代码
├── dist/                  # 构建输出
└──  docs/                  # API 文档
```

## 与原版 Axios 的区别

本项目是基于 TypeScript 从零重新实现的 Axios，主要特点：

1. **完全的 TypeScript 支持** - 从设计之初就考虑了类型安全
2. **现代化的构建工具链** - 使用 Rollup、Jest、ESLint 等现代工具
3. **更好的代码组织** - 模块化的代码结构，易于维护和扩展
4. **完整的测试覆盖** - 高质量的单元测试，确保代码可靠性

## 浏览器支持

- Chrome >= 49
- Firefox >= 52
- Safari >= 10
- Edge >= 14
- IE >= 11（需要 polyfill）

## 许可证

[MIT License](LICENSE) © 2025 cheeseburgertony

## 贡献

欢迎贡献代码！

## 更新日志

查看 [Releases](https://github.com/cheeseburgertony/ts-axios/releases) 获取版本更新信息。

## 相关链接

- [原版 Axios](https://github.com/axios/axios)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest 测试框架](https://jestjs.io/)
- [Conventional Commits](https://conventionalcommits.org/)
