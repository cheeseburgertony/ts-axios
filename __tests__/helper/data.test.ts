import { transformRequest, transformResponse } from "../../src/helper/data";

describe("数据转换函数测试", () => {
	describe("transformRequest 函数", () => {
		it("应该将普通对象转换为 JSON 字符串", () => {
			const data = { name: "John", age: 30 };
			const result = transformRequest(data);

			expect(result).toBe('{"name":"John","age":30}');
			expect(typeof result).toBe("string");
		});

		it("应该处理嵌套对象", () => {
			const data = {
				user: {
					name: "John",
					profile: {
						age: 30,
						city: "New York"
					}
				}
			};
			const result = transformRequest(data);

			expect(result).toBe(
				'{"user":{"name":"John","profile":{"age":30,"city":"New York"}}}'
			);
		});

		it("应该处理包含数组的对象", () => {
			const data = {
				users: ["John", "Jane"],
				numbers: [1, 2, 3]
			};
			const result = transformRequest(data);

			expect(result).toBe('{"users":["John","Jane"],"numbers":[1,2,3]}');
		});

		it("应该处理空对象", () => {
			const data = {};
			const result = transformRequest(data);

			expect(result).toBe("{}");
		});

		it("应该对非普通对象直接返回原值", () => {
			// 测试数组
			const arrayData = [1, 2, 3];
			expect(transformRequest(arrayData)).toBe(arrayData);

			// 测试 Date 对象
			const dateData = new Date();
			expect(transformRequest(dateData)).toBe(dateData);

			// 测试 FormData
			const formData = new FormData();
			expect(transformRequest(formData)).toBe(formData);

			// 测试 URLSearchParams
			const urlParams = new URLSearchParams();
			expect(transformRequest(urlParams)).toBe(urlParams);
		});

		it("应该对字符串直接返回", () => {
			const stringData = "hello world";
			const result = transformRequest(stringData);

			expect(result).toBe(stringData);
		});

		it("应该对数字直接返回", () => {
			const numberData = 123;
			const result = transformRequest(numberData);

			expect(result).toBe(numberData);
		});

		it("应该对布尔值直接返回", () => {
			expect(transformRequest(true)).toBe(true);
			expect(transformRequest(false)).toBe(false);
		});

		it("应该对 null 和 undefined 直接返回", () => {
			expect(transformRequest(null)).toBe(null);
			expect(transformRequest(undefined)).toBe(undefined);
		});

		it("应该处理包含特殊字符的对象", () => {
			const data = {
				message: 'Hello "World"',
				path: "C:\\Users\\test",
				unicode: "你好世界"
			};
			const result = transformRequest(data);

			expect(result).toBe(
				'{"message":"Hello \\"World\\"","path":"C:\\\\Users\\\\test","unicode":"你好世界"}'
			);
		});

		it("应该处理包含 null 和 undefined 属性的对象", () => {
			const data = {
				name: "John",
				age: null,
				city: undefined,
				active: true
			};
			const result = transformRequest(data);

			expect(result).toBe('{"name":"John","age":null,"active":true}');
		});
	});

	describe("transformResponse 函数", () => {
		it("应该将有效的 JSON 字符串解析为对象", () => {
			const jsonString = '{"name":"John","age":30}';
			const result = transformResponse(jsonString);

			expect(result).toEqual({ name: "John", age: 30 });
			expect(typeof result).toBe("object");
		});

		it("应该解析嵌套的 JSON 对象", () => {
			const jsonString =
				'{"user":{"name":"John","profile":{"age":30,"city":"New York"}}}';
			const result = transformResponse(jsonString);

			expect(result).toEqual({
				user: {
					name: "John",
					profile: {
						age: 30,
						city: "New York"
					}
				}
			});
		});

		it("应该解析包含数组的 JSON", () => {
			const jsonString = '{"users":["John","Jane"],"numbers":[1,2,3]}';
			const result = transformResponse(jsonString);

			expect(result).toEqual({
				users: ["John", "Jane"],
				numbers: [1, 2, 3]
			});
		});

		it("应该解析 JSON 数组", () => {
			const jsonString = '[{"name":"John"},{"name":"Jane"}]';
			const result = transformResponse(jsonString);

			expect(result).toEqual([{ name: "John" }, { name: "Jane" }]);
		});

		it("应该解析基本类型的 JSON", () => {
			expect(transformResponse('"hello"')).toBe("hello");
			expect(transformResponse("123")).toBe(123);
			expect(transformResponse("true")).toBe(true);
			expect(transformResponse("false")).toBe(false);
			expect(transformResponse("null")).toBe(null);
		});

		it("应该对无效的 JSON 字符串返回原值", () => {
			const invalidJson = '{"invalid": json}';
			const result = transformResponse(invalidJson);

			expect(result).toBe(invalidJson);
		});

		it("应该对非 JSON 格式的字符串返回原值", () => {
			const plainString = "hello world";
			const result = transformResponse(plainString);

			expect(result).toBe(plainString);
		});

		it("应该对空字符串返回原值", () => {
			const emptyString = "";
			const result = transformResponse(emptyString);

			expect(result).toBe(emptyString);
		});

		it("应该对非字符串类型直接返回", () => {
			// 测试数字
			expect(transformResponse(123)).toBe(123);

			// 测试对象
			const obj = { name: "John" };
			expect(transformResponse(obj)).toBe(obj);

			// 测试数组
			const arr = [1, 2, 3];
			expect(transformResponse(arr)).toBe(arr);

			// 测试布尔值
			expect(transformResponse(true)).toBe(true);
			expect(transformResponse(false)).toBe(false);

			// 测试 null 和 undefined
			expect(transformResponse(null)).toBe(null);
			expect(transformResponse(undefined)).toBe(undefined);
		});

		it("应该处理包含转义字符的 JSON", () => {
			const jsonWithEscape =
				'{"message":"Hello \\"World\\"","path":"C:\\\\Users\\\\test"}';
			const result = transformResponse(jsonWithEscape);

			expect(result).toEqual({
				message: 'Hello "World"',
				path: "C:\\Users\\test"
			});
		});

		it("应该处理包含 Unicode 字符的 JSON", () => {
			const jsonWithUnicode = '{"message":"你好世界","emoji":"😀"}';
			const result = transformResponse(jsonWithUnicode);

			expect(result).toEqual({
				message: "你好世界",
				emoji: "😀"
			});
		});

		it("应该处理格式不完整的 JSON", () => {
			const incompleteJson = '{"name":"John"';
			const result = transformResponse(incompleteJson);

			expect(result).toBe(incompleteJson);
		});

		it("应该处理包含注释的 JSON（应该失败并返回原值）", () => {
			const jsonWithComments = '{"name":"John"/* comment */}';
			const result = transformResponse(jsonWithComments);

			expect(result).toBe(jsonWithComments);
		});
	});

	describe("数据转换集成测试", () => {
		it("transformRequest 和 transformResponse 应该互为逆操作", () => {
			const originalData = {
				name: "John",
				age: 30,
				profile: {
					city: "New York",
					hobbies: ["reading", "swimming"]
				}
			};

			const transformed = transformRequest(originalData);
			const restored = transformResponse(transformed);

			expect(restored).toEqual(originalData);
		});

		it("应该正确处理复杂的数据转换流程", () => {
			const complexData = {
				users: [
					{ id: 1, name: "John", active: true },
					{ id: 2, name: "Jane", active: false }
				],
				meta: {
					total: 2,
					page: 1,
					timestamp: null
				}
			};

			const jsonString = transformRequest(complexData);
			const parsedData = transformResponse(jsonString);

			expect(parsedData).toEqual(complexData);
			expect(typeof jsonString).toBe("string");
			expect(typeof parsedData).toBe("object");
		});
	});
});
