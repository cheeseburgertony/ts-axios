import {
	processHeaders,
	parseHeaders,
	flattenHeaders
} from "../../src/helper/headers";
import { Method } from "../../src/types";

describe("请求头处理函数测试", () => {
	describe("processHeaders 函数", () => {
		it("应该为普通对象数据添加默认 Content-Type", () => {
			const headers = {};
			const data = { name: "John", age: 30 };

			const result = processHeaders(headers, data);

			expect(result["Content-Type"]).toBe("application/json;charset=utf-8");
		});

		it("应该保留已存在的 Content-Type", () => {
			const headers = { "Content-Type": "application/xml" };
			const data = { name: "John" };

			const result = processHeaders(headers, data);

			expect(result["Content-Type"]).toBe("application/xml");
		});

		it("应该规范化 Content-Type 头名称", () => {
			const headers = { "content-type": "application/xml" };
			const data = { name: "John" };

			const result = processHeaders(headers, data);

			expect(result["Content-Type"]).toBe("application/xml");
			expect(result["content-type"]).toBeUndefined();
		});

		it("应该规范化不同大小写的 Content-Type", () => {
			const headers = { "CONTENT-TYPE": "text/plain", "Content-Length": "100" };
			const data = { name: "John" };

			const result = processHeaders(headers, data);

			expect(result["Content-Type"]).toBe("text/plain");
			expect(result["CONTENT-TYPE"]).toBeUndefined();
			expect(result["Content-Length"]).toBe("100");
		});

		it("应该不为非普通对象数据添加 Content-Type", () => {
			const headers = {};

			// 测试字符串数据
			const stringResult = processHeaders({ ...headers }, "string data");
			expect(stringResult["Content-Type"]).toBeUndefined();

			// 测试数组数据
			const arrayResult = processHeaders({ ...headers }, [1, 2, 3]);
			expect(arrayResult["Content-Type"]).toBeUndefined();

			// 测试 FormData
			const formData = new FormData();
			const formResult = processHeaders({ ...headers }, formData);
			expect(formResult["Content-Type"]).toBeUndefined();
		});

		it("应该处理 null 或 undefined 的 headers", () => {
			const data = { name: "John" };

			expect(() => processHeaders(null, data)).not.toThrow();
			expect(() => processHeaders(undefined, data)).not.toThrow();

			const nullResult = processHeaders(null, data);
			expect(nullResult).toBe(null);
		});

		it("应该处理空对象 headers", () => {
			const headers = {};
			const data = { name: "John" };

			const result = processHeaders(headers, data);

			expect(result["Content-Type"]).toBe("application/json;charset=utf-8");
		});

		it("应该处理包含其他头的情况", () => {
			const headers = {
				Authorization: "Bearer token",
				"X-Custom-Header": "custom-value"
			};
			const data = { name: "John" };

			const result = processHeaders(headers, data);

			expect(result["Content-Type"]).toBe("application/json;charset=utf-8");
			expect(result["Authorization"]).toBe("Bearer token");
			expect(result["X-Custom-Header"]).toBe("custom-value");
		});
	});

	describe("parseHeaders 函数", () => {
		it("应该解析标准的 HTTP 响应头", () => {
			const headersString =
				"Content-Type: application/json\r\nContent-Length: 123\r\nAuthorization: Bearer token";

			const result = parseHeaders(headersString);

			expect(result["content-type"]).toBe("application/json");
			expect(result["content-length"]).toBe("123");
			expect(result["authorization"]).toBe("Bearer token");
		});

		it("应该处理包含空格的头值", () => {
			const headersString =
				"Content-Type:   application/json   \r\nAuthorization:   Bearer token   ";

			const result = parseHeaders(headersString);

			expect(result["content-type"]).toBe("application/json");
			expect(result["authorization"]).toBe("Bearer token");
		});

		it("应该忽略无效的头行", () => {
			const headersString =
				"Content-Type: application/json\r\nInvalidLine\r\nAuthorization: Bearer token";

			const result = parseHeaders(headersString);

			expect(result["content-type"]).toBe("application/json");
			expect(result["authorization"]).toBe("Bearer token");
			expect(Object.keys(result)).toHaveLength(2);
		});

		it("应该处理空字符串", () => {
			const result = parseHeaders("");

			expect(result).toEqual({});
		});

		it("应该处理只有 \\r\\n 的字符串", () => {
			const result = parseHeaders("\r\n\r\n");

			expect(result).toEqual({});
		});

		it("应该处理没有值的头", () => {
			const headersString = "Content-Type:\r\nX-Empty-Header:";

			const result = parseHeaders(headersString);

			expect(result["content-type"]).toBe("");
			expect(result["x-empty-header"]).toBe("");
		});

		it("应该处理包含冒号的头值", () => {
			const headersString =
				"Content-Type: application/json\r\nCustom-Header: value:with:colons";

			const result = parseHeaders(headersString);

			expect(result["content-type"]).toBe("application/json");
			expect(result["custom-header"]).toBe("value:with:colons");
		});

		it("应该忽略冒号前没有内容的行", () => {
			const headersString =
				": no-header-name\r\n   : only-spaces\r\nValid-Header: value";

			const result = parseHeaders(headersString);

			expect(result["valid-header"]).toBe("value");
			expect(Object.keys(result)).toHaveLength(1);
		});

		it("应该将头名称转换为小写", () => {
			const headersString =
				"CONTENT-TYPE: application/json\r\nAUTHORIZATION: Bearer token";

			const result = parseHeaders(headersString);

			expect(result["content-type"]).toBe("application/json");
			expect(result["authorization"]).toBe("Bearer token");
			expect(result["CONTENT-TYPE"]).toBeUndefined();
			expect(result["AUTHORIZATION"]).toBeUndefined();
		});

		it("应该处理复杂的真实响应头", () => {
			const headersString = [
				"HTTP/1.1 200 OK",
				"Content-Type: application/json; charset=utf-8",
				"Content-Length: 1234",
				"Cache-Control: no-cache, no-store, must-revalidate",
				"Set-Cookie: sessionId=abc123; Path=/; HttpOnly",
				"X-Rate-Limit: 100",
				"Date: Wed, 21 Oct 2015 07:28:00 GMT"
			].join("\r\n");

			const result = parseHeaders(headersString);

			expect(result["content-type"]).toBe("application/json; charset=utf-8");
			expect(result["content-length"]).toBe("1234");
			expect(result["cache-control"]).toBe(
				"no-cache, no-store, must-revalidate"
			);
			expect(result["set-cookie"]).toBe("sessionId=abc123; Path=/; HttpOnly");
			expect(result["x-rate-limit"]).toBe("100");
			expect(result["date"]).toBe("Wed, 21 Oct 2015 07:28:00 GMT");
		});
	});

	describe("flattenHeaders 函数", () => {
		it("应该合并通用头和方法特定头", () => {
			const headers = {
				common: {
					Accept: "application/json",
					Authorization: "Bearer token"
				},
				get: {
					"Cache-Control": "no-cache"
				},
				"Content-Type": "application/json"
			};

			const result = flattenHeaders(headers, "get");

			expect(result["Accept"]).toBe("application/json");
			expect(result["Authorization"]).toBe("Bearer token");
			expect(result["Cache-Control"]).toBe("no-cache");
			expect(result["Content-Type"]).toBe("application/json");
		});

		it("应该删除所有方法特定的键", () => {
			const headers = {
				common: { Accept: "application/json" },
				get: { "Cache-Control": "no-cache" },
				post: { "Content-Type": "application/json" },
				put: { "X-Method": "PUT" },
				delete: { "X-Method": "DELETE" },
				patch: { "X-Method": "PATCH" },
				head: { "X-Method": "HEAD" },
				options: { "X-Method": "OPTIONS" },
				"Custom-Header": "custom-value"
			};

			const result = flattenHeaders(headers, "get");

			expect(result.common).toBeUndefined();
			expect(result.get).toBeUndefined();
			expect(result.post).toBeUndefined();
			expect(result.put).toBeUndefined();
			expect(result.delete).toBeUndefined();
			expect(result.patch).toBeUndefined();
			expect(result.head).toBeUndefined();
			expect(result.options).toBeUndefined();
			expect(result["Custom-Header"]).toBe("custom-value");
		});

		it("应该处理优先级：direct > method > common", () => {
			const headers = {
				common: {
					"Content-Type": "from-common",
					Accept: "application/json"
				},
				post: {
					"Content-Type": "from-post",
					Authorization: "Bearer token"
				},
				"Content-Type": "from-direct"
			};

			const result = flattenHeaders(headers, "post");

			expect(result["Content-Type"]).toBe("from-direct");
			expect(result["Accept"]).toBe("application/json");
			expect(result["Authorization"]).toBe("Bearer token");
		});

		it("应该处理空的 headers", () => {
			expect(flattenHeaders(null, "get")).toBe(null);
			expect(flattenHeaders(undefined, "get")).toBe(undefined);
		});

		it("应该处理只有 common 的情况", () => {
			const headers = {
				common: {
					Accept: "application/json",
					Authorization: "Bearer token"
				}
			};

			const result = flattenHeaders(headers, "get");

			expect(result["Accept"]).toBe("application/json");
			expect(result["Authorization"]).toBe("Bearer token");
			expect(result.common).toBeUndefined();
		});

		it("应该处理只有方法特定头的情况", () => {
			const headers = {
				post: {
					"Content-Type": "application/json"
				}
			};

			const result = flattenHeaders(headers, "post");

			expect(result["Content-Type"]).toBe("application/json");
			expect(result.post).toBeUndefined();
		});

		it("应该处理只有直接头的情况", () => {
			const headers = {
				"Content-Type": "application/json",
				Authorization: "Bearer token"
			};

			const result = flattenHeaders(headers, "get");

			expect(result["Content-Type"]).toBe("application/json");
			expect(result["Authorization"]).toBe("Bearer token");
		});

		it("应该处理不匹配的方法", () => {
			const headers = {
				common: { Accept: "application/json" },
				post: { "Content-Type": "application/json" },
				Authorization: "Bearer token"
			};

			const result = flattenHeaders(headers, "get");

			expect(result["Accept"]).toBe("application/json");
			expect(result["Authorization"]).toBe("Bearer token");
			expect(result["Content-Type"]).toBeUndefined();
			expect(result.post).toBeUndefined();
		});

		it("应该正确处理所有 HTTP 方法", () => {
			const methods: Method[] = [
				"get",
				"post",
				"put",
				"delete",
				"patch",
				"head",
				"options"
			];

			methods.forEach((method) => {
				const headers = {
					common: { Accept: "application/json" },
					[method]: { "X-Method": method.toUpperCase() }
				};

				const result = flattenHeaders(headers, method);

				expect(result["Accept"]).toBe("application/json");
				expect(result["X-Method"]).toBe(method.toUpperCase());
				expect(result.common).toBeUndefined();
				expect(result[method]).toBeUndefined();
			});
		});
	});

	describe("headers 函数集成测试", () => {
		it("应该支持完整的头处理流程", () => {
			// 1. 处理请求头
			const requestHeaders = {
				"content-type": "text/plain", // 需要规范化
				authorization: "Bearer token"
			};
			const requestData = { name: "John" };

			const processedHeaders = processHeaders(requestHeaders, requestData);
			expect(processedHeaders["Content-Type"]).toBe("text/plain");

			// 2. 扁平化头（模拟配置）
			const configHeaders = {
				common: { Accept: "application/json" },
				post: { "Cache-Control": "no-cache" },
				...processedHeaders
			};

			const flattenedHeaders = flattenHeaders(configHeaders, "post");
			expect(flattenedHeaders["Accept"]).toBe("application/json");
			expect(flattenedHeaders["Cache-Control"]).toBe("no-cache");
			expect(flattenedHeaders["Content-Type"]).toBe("text/plain");

			// 3. 解析响应头
			const responseHeaderString =
				"Content-Type: application/json\r\nContent-Length: 123";
			const parsedResponseHeaders = parseHeaders(responseHeaderString);
			expect(parsedResponseHeaders["content-type"]).toBe("application/json");
			expect(parsedResponseHeaders["content-length"]).toBe("123");
		});
	});
});
