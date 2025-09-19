import {
	buildURL,
	isURLSameOrigin,
	isAbsoluteURL,
	combineURL
} from "../../src/helper/url";

describe("URL 处理函数测试", () => {
	describe("buildURL 函数", () => {
		it("应该返回原 URL 当没有参数时", () => {
			const url = "https://api.example.com/users";
			expect(buildURL(url)).toBe(url);
			expect(buildURL(url, null)).toBe(url);
			expect(buildURL(url, undefined)).toBe(url);
		});

		it("应该构建带简单参数的 URL", () => {
			const url = "https://api.example.com/users";
			const params = { name: "John", age: 30 };

			const result = buildURL(url, params);

			expect(result).toBe("https://api.example.com/users?name=John&age=30");
		});

		it("应该处理数组参数", () => {
			const url = "https://api.example.com/users";
			const params = { tags: ["js", "ts"] };

			const result = buildURL(url, params);

			expect(result).toBe("https://api.example.com/users?tags[]=js&tags[]=ts");
		});

		it("应该跳过 null 和 undefined 值", () => {
			const url = "https://api.example.com/users";
			const params = { name: "John", age: null, city: undefined, active: true };

			const result = buildURL(url, params);

			expect(result).toBe(
				"https://api.example.com/users?name=John&active=true"
			);
		});

		it("应该正确处理 Date 对象", () => {
			const url = "https://api.example.com/users";
			const date = new Date("2023-01-01T00:00:00.000Z");
			const params = { createdAt: date };

			const result = buildURL(url, params);

			expect(result).toBe(
				"https://api.example.com/users?createdAt=2023-01-01T00:00:00.000Z"
			);
		});

		it("应该正确处理普通对象", () => {
			const url = "https://api.example.com/users";
			const params = { user: { name: "John", age: 30 } };

			const result = buildURL(url, params);

			expect(result).toContain(
				"users?user=%7B%22name%22:%22John%22,%22age%22:30%7D"
			);
		});

		it("应该正确编码特殊字符但保留某些字符", () => {
			const url = "https://api.example.com/search";
			const params = {
				query: "hello world",
				email: "test@example.com",
				url: "http://example.com:8080",
				money: "$100",
				list: "[item1,item2]"
			};

			const result = buildURL(url, params);

			expect(result).toContain("query=hello+world"); // 空格变成+
			expect(result).toContain("email=test@example.com"); // @保留
			expect(result).toContain("url=http:%2F%2Fexample.com:8080"); // :保留, //被编码
			expect(result).toContain("money=$100"); // $保留
			expect(result).toContain("list=[item1,item2]"); // []和,保留
		});

		it("应该处理已有查询参数的 URL", () => {
			const url = "https://api.example.com/users?existing=true";
			const params = { name: "John" };

			const result = buildURL(url, params);

			expect(result).toBe(
				"https://api.example.com/users?existing=true&name=John"
			);
		});

		it("应该移除 URL 中的 hash 片段", () => {
			const url = "https://api.example.com/users#section";
			const params = { name: "John" };

			const result = buildURL(url, params);

			expect(result).toBe("https://api.example.com/users?name=John");
		});

		it("应该处理同时包含查询参数和 hash 的 URL", () => {
			const url = "https://api.example.com/users?existing=true#section";
			const params = { name: "John" };

			const result = buildURL(url, params);

			expect(result).toBe(
				"https://api.example.com/users?existing=true&name=John"
			);
		});

		it("应该支持 URLSearchParams 对象", () => {
			const url = "https://api.example.com/users";
			const params = new URLSearchParams();
			params.append("name", "John");
			params.append("age", "30");

			const result = buildURL(url, params);

			expect(result).toBe("https://api.example.com/users?name=John&age=30");
		});

		it("应该使用自定义参数序列化器", () => {
			const url = "https://api.example.com/users";
			const params = { name: "John", age: 30 };
			const paramsSerializer = (params: any) => {
				return Object.keys(params)
					.map((key) => `${key}:${params[key]}`)
					.join("|");
			};

			const result = buildURL(url, params, paramsSerializer);

			expect(result).toBe("https://api.example.com/users?name:John|age:30");
		});

		it("应该处理空数组", () => {
			const url = "https://api.example.com/users";
			const params = { tags: [] };

			const result = buildURL(url, params);

			expect(result).toBe("https://api.example.com/users");
		});

		it("应该处理包含数组和对象的复杂参数", () => {
			const url = "https://api.example.com/search";
			const params = {
				q: "search term",
				tags: ["js", "ts"],
				user: { id: 1, name: "John" },
				active: true
			};

			const result = buildURL(url, params);

			expect(result).toContain("q=search+term");
			expect(result).toContain("tags[]=js&tags[]=ts");
			expect(result).toContain("active=true");
			expect(result).toContain("user=");
		});
	});

	describe("isAbsoluteURL 函数", () => {
		it("应该对 HTTP/HTTPS URL 返回 true", () => {
			expect(isAbsoluteURL("http://example.com")).toBe(true);
			expect(isAbsoluteURL("https://example.com")).toBe(true);
			expect(isAbsoluteURL("HTTP://EXAMPLE.COM")).toBe(true);
			expect(isAbsoluteURL("HTTPS://EXAMPLE.COM")).toBe(true);
		});

		it("应该对协议相对 URL 返回 true", () => {
			expect(isAbsoluteURL("//example.com")).toBe(true);
			expect(isAbsoluteURL("//api.example.com/users")).toBe(true);
		});

		it("应该对其他协议的 URL 返回 true", () => {
			expect(isAbsoluteURL("ftp://example.com")).toBe(true);
			expect(isAbsoluteURL("file://localhost/path")).toBe(true);
			expect(isAbsoluteURL("ws://example.com")).toBe(true);
			expect(isAbsoluteURL("custom-protocol://example.com")).toBe(true);
		});

		it("应该对相对 URL 返回 false", () => {
			expect(isAbsoluteURL("/api/users")).toBe(false);
			expect(isAbsoluteURL("api/users")).toBe(false);
			expect(isAbsoluteURL("./users")).toBe(false);
			expect(isAbsoluteURL("../users")).toBe(false);
			expect(isAbsoluteURL("")).toBe(false);
		});

		it("应该对无效格式返回 false", () => {
			expect(isAbsoluteURL("not-a-url")).toBe(false);
			expect(isAbsoluteURL("http:")).toBe(false);
			expect(isAbsoluteURL("http:example.com")).toBe(false);
		});
	});

	describe("combineURL 函数", () => {
		it("应该正确组合 baseURL 和 relativeURL", () => {
			const baseURL = "https://api.example.com";
			const relativeURL = "users";

			const result = combineURL(baseURL, relativeURL);

			expect(result).toBe("https://api.example.com/users");
		});

		it("应该处理 baseURL 末尾的斜杠", () => {
			const baseURL = "https://api.example.com/";
			const relativeURL = "users";

			const result = combineURL(baseURL, relativeURL);

			expect(result).toBe("https://api.example.com/users");
		});

		it("应该处理 relativeURL 开头的斜杠", () => {
			const baseURL = "https://api.example.com";
			const relativeURL = "/users";

			const result = combineURL(baseURL, relativeURL);

			expect(result).toBe("https://api.example.com/users");
		});

		it("应该处理两端都有斜杠的情况", () => {
			const baseURL = "https://api.example.com/";
			const relativeURL = "/users";

			const result = combineURL(baseURL, relativeURL);

			expect(result).toBe("https://api.example.com/users");
		});

		it("应该处理多个斜杠", () => {
			const baseURL = "https://api.example.com///";
			const relativeURL = "///users";

			const result = combineURL(baseURL, relativeURL);

			expect(result).toBe("https://api.example.com/users");
		});

		it("应该处理没有 relativeURL 的情况", () => {
			const baseURL = "https://api.example.com/";

			expect(combineURL(baseURL)).toBe(baseURL);
			expect(combineURL(baseURL, undefined)).toBe(baseURL);
			expect(combineURL(baseURL, "")).toBe(baseURL);
		});

		it("应该处理包含查询参数的 relativeURL", () => {
			const baseURL = "https://api.example.com";
			const relativeURL = "users?page=1&limit=10";

			const result = combineURL(baseURL, relativeURL);

			expect(result).toBe("https://api.example.com/users?page=1&limit=10");
		});
	});

	describe("isURLSameOrigin 函数", () => {
		it("应该对相同协议和主机返回 true", () => {
			const result = isURLSameOrigin(window.location.href);

			expect(result).toBe(true);
		});

		it("应该对不同协议返回 false", () => {
			const url = "http://example.com:8080/api/users";

			const result = isURLSameOrigin(url);

			expect(result).toBe(false);
		});

		it("应该对不同主机返回 false", () => {
			const url = "https://other.com:8080/api/users";

			const result = isURLSameOrigin(url);

			expect(result).toBe(false);
		});

		it("应该对不同端口返回 false", () => {
			const url = "https://example.com:9090/api/users";

			const result = isURLSameOrigin(url);

			expect(result).toBe(false);
		});

		it("应该处理相对路径（相同 origin）", () => {
			const url = "/api/users";

			const result = isURLSameOrigin(url);

			expect(result).toBe(true);
		});

		it("应该处理子域名", () => {
			const url = "https://api.example.com:8080/users";

			const result = isURLSameOrigin(url);

			expect(result).toBe(false);
		});
	});

	describe("URL 处理综合测试", () => {
		it("应该支持完整的 URL 构建流程", () => {
			// 1. 组合 base URL 和相对路径
			const baseURL = "https://api.example.com";
			const endpoint = "users";
			const fullURL = combineURL(baseURL, endpoint);

			// 2. 添加查询参数
			const params = { page: 1, limit: 10, active: true };
			const urlWithParams = buildURL(fullURL, params);

			expect(urlWithParams).toBe(
				"https://api.example.com/users?page=1&limit=10&active=true"
			);

			// 3. 检查是否为绝对 URL
			expect(isAbsoluteURL(urlWithParams)).toBe(true);
		});
	});
});
