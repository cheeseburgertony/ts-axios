import {
	isDate,
	isPlainObject,
	isFormData,
	isURLSearchParams,
	extend,
	deepMerge
} from "../src/helper/util";

describe("工具函数utils测试", () => {
	describe("isDate 函数", () => {
		it("应该对 Date 对象返回 true", () => {
			expect(isDate(new Date())).toBe(true);
			expect(isDate(new Date("2023-01-01"))).toBe(true);
		});

		it("应该对非 Date 对象返回 false", () => {
			expect(isDate("2023-01-01")).toBe(false);
			expect(isDate(123456789)).toBe(false);
			expect(isDate({})).toBe(false);
			expect(isDate([])).toBe(false);
			expect(isDate(null)).toBe(false);
			expect(isDate(undefined)).toBe(false);
		});
	});

	describe("isPlainObject 函数", () => {
		it("应该对普通对象返回 true", () => {
			expect(isPlainObject({})).toBe(true);
			expect(isPlainObject({ a: 1 })).toBe(true);
		});

		it("应该对非普通对象返回 false", () => {
			expect(isPlainObject([])).toBe(false);
			expect(isPlainObject(new Date())).toBe(false);
			expect(isPlainObject(/regex/)).toBe(false);
			expect(isPlainObject(null)).toBe(false);
			expect(isPlainObject(undefined)).toBe(false);
			expect(isPlainObject("string")).toBe(false);
			expect(isPlainObject(123)).toBe(false);
			expect(isPlainObject(() => {})).toBe(false);
		});
	});

	describe("isFormData 函数", () => {
		it("应该对 FormData 实例返回 true", () => {
			const formData = new FormData();
			expect(isFormData(formData)).toBe(true);
		});

		it("应该对非 FormData 值返回 false", () => {
			expect(isFormData({})).toBe(false);
			expect(isFormData([])).toBe(false);
			expect(isFormData("string")).toBe(false);
			expect(isFormData(null)).toBe(false);
			expect(isFormData(undefined)).toBe(false);
		});
	});

	describe("isURLSearchParams 函数", () => {
		it("应该对 URLSearchParams 实例返回 true", () => {
			const params = new URLSearchParams();
			expect(isURLSearchParams(params)).toBe(true);
			expect(isURLSearchParams(new URLSearchParams("a=1&b=2"))).toBe(true);
		});

		it("应该对非 URLSearchParams 值返回 false", () => {
			expect(isURLSearchParams({})).toBe(false);
			expect(isURLSearchParams([])).toBe(false);
			expect(isURLSearchParams("a=1&b=2")).toBe(false);
			expect(isURLSearchParams(null)).toBe(false);
			expect(isURLSearchParams(undefined)).toBe(false);
		});
	});

	describe("extend 函数", () => {
		it("应该将源对象的属性合并到目标对象", () => {
			const to = { a: 1 };
			const from = { b: 2, c: 3 };
			const result = extend(to, from);

			expect(result).toEqual({ a: 1, b: 2, c: 3 });
			expect(result).toBe(to);
		});

		it("应该复制原型上的方法", () => {
			class TestClass {
				prop = "value";
				method() {
					return this.prop;
				}
			}

			const from = new TestClass();
			const to = {} as any;
			const result = extend(to, from);

			expect(result.prop).toBe("value");
			expect(typeof result.method).toBe("function");
			expect(result.method()).toBe("value");
		});

		it("应该处理 null/undefined 源对象", () => {
			const to = { a: 1 };
			expect(extend(to, null)).toBe(to);
			expect(extend(to, undefined)).toBe(to);
		});
	});

	describe("deepMerge 函数", () => {
		it("应该合并简单对象", () => {
			const obj1 = { a: 1, b: 2 };
			const obj2 = { c: 3, d: 4 };
			const result = deepMerge(obj1, obj2);

			expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
		});

		it("应该深度合并嵌套对象", () => {
			const obj1 = { a: { x: 1, y: 2 }, b: 1 };
			const obj2 = { a: { y: 3, z: 4 }, c: 2 };
			const result = deepMerge(obj1, obj2);

			expect(result).toEqual({
				a: { x: 1, y: 3, z: 4 },
				b: 1,
				c: 2
			});
		});

		it("应该处理多个对象合并", () => {
			const obj1 = { a: 1 };
			const obj2 = { b: 2 };
			const obj3 = { c: 3 };
			const result = deepMerge(obj1, obj2, obj3);

			expect(result).toEqual({ a: 1, b: 2, c: 3 });
		});

		it("应该覆盖非对象值", () => {
			const obj1 = { a: 1, b: { x: 1 } };
			const obj2 = { a: 2, b: "string" };
			const result = deepMerge(obj1, obj2);

			expect(result).toEqual({ a: 2, b: "string" });
		});

		it("应该处理 null/undefined 对象", () => {
			const obj = { a: 1 };
			const result = deepMerge(obj, null, undefined, { b: 2 });

			expect(result).toEqual({ a: 1, b: 2 });
		});

		it("应该创建空原型对象", () => {
			const result = deepMerge({ a: 1 });

			expect(Object.getPrototypeOf(result)).toBe(null);
		});
	});
});
