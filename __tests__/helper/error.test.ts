import { AxiosError, createError } from "../../src/helper/error";
import { AxiosRequestConfig, AxiosResponse } from "../../src/types";

describe("错误处理函数测试", () => {
	// 模拟数据
	const mockConfig: AxiosRequestConfig = {
		url: "/test",
		method: "get",
		timeout: 5000
	};

	const mockRequest = new XMLHttpRequest();

	const mockResponse: AxiosResponse = {
		data: { error: "Not Found" },
		status: 404,
		statusText: "Not Found",
		headers: {},
		config: mockConfig,
		request: mockRequest
	};

	describe("AxiosError 类", () => {
		it("应该正确创建 AxiosError 实例", () => {
			const message = "Request failed";
			const code = "NETWORK_ERROR";

			const error = new AxiosError(
				message,
				mockConfig,
				code,
				mockRequest,
				mockResponse
			);

			expect(error).toBeInstanceOf(AxiosError);
			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(message);
			expect(error.config).toBe(mockConfig);
			expect(error.code).toBe(code);
			expect(error.request).toBe(mockRequest);
			expect(error.response).toBe(mockResponse);
			expect(error.isAxiosError).toBe(true);
		});

		it("应该支持只传必需参数", () => {
			const message = "Basic error";

			const error = new AxiosError(message, mockConfig);

			expect(error.message).toBe(message);
			expect(error.config).toBe(mockConfig);
			expect(error.code).toBeUndefined();
			expect(error.request).toBeUndefined();
			expect(error.response).toBeUndefined();
			expect(error.isAxiosError).toBe(true);
		});

		it("应该支持传入 null 作为 code", () => {
			const message = "Error with null code";

			const error = new AxiosError(message, mockConfig, null);

			expect(error.message).toBe(message);
			expect(error.code).toBe(null);
			expect(error.isAxiosError).toBe(true);
		});

		it("应该正确设置原型链", () => {
			const error = new AxiosError("Test error", mockConfig);

			expect(Object.getPrototypeOf(error)).toBe(AxiosError.prototype);
			expect(error.constructor).toBe(AxiosError);
		});

		it("应该继承 Error 的属性和方法", () => {
			const message = "Test error message";
			const error = new AxiosError(message, mockConfig);

			expect(error.message).toBe(message);
			expect(error.stack).toBeDefined();
			expect(typeof error.toString).toBe("function");
		});

		it("应该支持错误堆栈追踪", () => {
			const error = new AxiosError("Stack trace test", mockConfig);

			expect(error.stack).toBeDefined();
			expect(error.stack).toContain("Stack trace test");
		});

		it("应该允许修改错误属性", () => {
			const error = new AxiosError("Original message", mockConfig);

			error.message = "Modified message";
			error.code = "MODIFIED_CODE";

			expect(error.message).toBe("Modified message");
			expect(error.code).toBe("MODIFIED_CODE");
		});

		it("应该正确处理复杂的配置对象", () => {
			const complexConfig: AxiosRequestConfig = {
				url: "/api/users",
				method: "post",
				baseURL: "https://api.example.com",
				timeout: 10000,
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer token"
				},
				params: { page: 1, limit: 10 },
				data: { name: "John", email: "john@example.com" }
			};

			const error = new AxiosError("Complex config error", complexConfig);

			expect(error.config).toBe(complexConfig);
			expect(error.config.url).toBe("/api/users");
			expect(error.config.headers).toEqual({
				"Content-Type": "application/json",
				Authorization: "Bearer token"
			});
		});

		it("应该正确处理包含嵌套对象的响应", () => {
			const nestedResponse: AxiosResponse = {
				data: {
					error: {
						code: "VALIDATION_ERROR",
						message: "Validation failed",
						details: [
							{ field: "email", message: "Invalid email format" },
							{ field: "age", message: "Age must be positive" }
						]
					}
				},
				status: 422,
				statusText: "Unprocessable Entity",
				headers: { "content-type": "application/json" },
				config: mockConfig,
				request: mockRequest
			};

			const error = new AxiosError(
				"Validation error",
				mockConfig,
				"VALIDATION_ERROR",
				mockRequest,
				nestedResponse
			);

			expect(error.response?.data.error.details).toHaveLength(2);
			expect(error.response?.data.error.details[0].field).toBe("email");
		});
	});

	describe("createError 函数", () => {
		it("应该创建并返回 AxiosError 实例", () => {
			const message = "Created error";
			const code = "TEST_ERROR";

			const error = createError(
				message,
				mockConfig,
				code,
				mockRequest,
				mockResponse
			);

			expect(error).toBeInstanceOf(AxiosError);
			expect(error.message).toBe(message);
			expect(error.config).toBe(mockConfig);
			expect(error.code).toBe(code);
			expect(error.request).toBe(mockRequest);
			expect(error.response).toBe(mockResponse);
			expect(error.isAxiosError).toBe(true);
		});

		it("应该支持只传必需参数", () => {
			const message = "Simple created error";

			const error = createError(message, mockConfig);

			expect(error).toBeInstanceOf(AxiosError);
			expect(error.message).toBe(message);
			expect(error.config).toBe(mockConfig);
			expect(error.code).toBeUndefined();
			expect(error.request).toBeUndefined();
			expect(error.response).toBeUndefined();
		});

		it("应该支持传入 null 作为 code", () => {
			const message = "Error with null code";

			const error = createError(message, mockConfig, null);

			expect(error.code).toBe(null);
		});

		it("应该创建具有正确原型链的错误对象", () => {
			const error = createError("Prototype test", mockConfig);

			expect(Object.getPrototypeOf(error)).toBe(AxiosError.prototype);
			expect(error instanceof Error).toBe(true);
			expect(error instanceof AxiosError).toBe(true);
		});
	});

	describe("错误对象的序列化和反序列化", () => {
		it("应该支持 JSON 序列化（部分属性）", () => {
			const error = new AxiosError(
				"Serialization test",
				mockConfig,
				"SERIALIZE_ERROR"
			);

			// 注意：Error 对象的某些属性（如 stack）可能不会被 JSON.stringify 序列化
			const serialized = JSON.stringify({
				message: error.message,
				config: error.config,
				code: error.code,
				isAxiosError: error.isAxiosError
			});

			const parsed = JSON.parse(serialized);

			expect(parsed.message).toBe("Serialization test");
			expect(parsed.code).toBe("SERIALIZE_ERROR");
			expect(parsed.isAxiosError).toBe(true);
		});

		it("应该正确处理循环引用的配置对象", () => {
			// 创建一个有循环引用的配置对象（在实际场景中可能出现）
			const configWithCircularRef: any = {
				url: "/test",
				method: "get"
			};
			configWithCircularRef.self = configWithCircularRef;

			// 应该能够创建错误对象而不抛出异常
			expect(() => {
				const error = new AxiosError(
					"Circular ref test",
					configWithCircularRef
				);
				expect(error.config).toBe(configWithCircularRef);
			}).not.toThrow();
		});
	});

	describe("错误处理的边界情况", () => {
		it("应该处理空字符串消息", () => {
			const error = new AxiosError("", mockConfig);

			expect(error.message).toBe("");
			expect(error.isAxiosError).toBe(true);
		});

		it("应该处理特殊字符的消息", () => {
			const specialMessage = 'Error with "quotes" and \n newlines and 中文';
			const error = new AxiosError(specialMessage, mockConfig);

			expect(error.message).toBe(specialMessage);
		});

		it("应该处理空的配置对象", () => {
			const emptyConfig: AxiosRequestConfig = {};
			const error = new AxiosError("Empty config", emptyConfig);

			expect(error.config).toBe(emptyConfig);
			expect(error.isAxiosError).toBe(true);
		});

		it("应该正确标识为 AxiosError", () => {
			const error = new AxiosError("Identity test", mockConfig);
			const regularError = new Error("Regular error");

			expect(error.isAxiosError).toBe(true);
			expect("isAxiosError" in regularError).toBe(false);
		});
	});

	describe("与标准 Error 的兼容性", () => {
		it("应该可以被 try-catch 捕获", () => {
			let caughtError: any;

			try {
				throw new AxiosError("Test throw", mockConfig);
			} catch (error) {
				caughtError = error;
			}

			expect(caughtError).toBeInstanceOf(AxiosError);
			expect(caughtError.isAxiosError).toBe(true);
		});

		it("应该可以使用 instanceof 检查", () => {
			const axiosError = new AxiosError("Instance test", mockConfig);
			const regularError = new Error("Regular error");

			expect(axiosError instanceof AxiosError).toBe(true);
			expect(axiosError instanceof Error).toBe(true);
			expect(regularError instanceof AxiosError).toBe(false);
		});

	});
});
