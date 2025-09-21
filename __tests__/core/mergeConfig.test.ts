import axios from "../../src/index";
import mergeConfig from "../../src/core/mergeConfig";

describe("配置合并测试", () => {
	const defaults = axios.defaults;

	test("应该接受 undefined 作为第二个参数", () => {
		expect(mergeConfig(defaults, undefined)).toEqual(defaults);
	});

	test("应该接受对象作为第二个参数", () => {
		expect(mergeConfig(defaults, {})).toEqual(defaults);
	});

	test("应该不留下引用关系", () => {
		const merged = mergeConfig(defaults, {});
		expect(merged).not.toBe(defaults);
		expect(merged.headers).not.toBe(defaults.headers);
	});

	test("应该允许设置请求选项", () => {
		const config = {
			url: "__sample url__",
			params: "__sample params__",
			data: { foo: true }
		};
		const merged = mergeConfig(defaults, config);
		expect(merged.url).toBe(config.url);
		expect(merged.params).toBe(config.params);
		expect(merged.data).toEqual(config.data);
	});

	test("应该不继承请求选项", () => {
		const localDefaults = {
			url: "__sample url__",
			params: "__sample params__",
			data: { foo: true }
		};
		const merged = mergeConfig(localDefaults, {});
		expect(merged.url).toBeUndefined();
		expect(merged.params).toBeUndefined();
		expect(merged.data).toBeUndefined();
	});

	test("应该在传入 undefined 配置时返回默认请求头", () => {
		expect(
			mergeConfig(
				{
					headers: "x-mock-header"
				},
				undefined
			)
		).toEqual({
			headers: "x-mock-header"
		});
	});

	test("应该将 auth 和 headers 与默认值合并", () => {
		expect(
			mergeConfig(
				{
					auth: undefined
				},
				{
					auth: {
						username: "foo",
						password: "test"
					}
				}
			)
		).toEqual({
			auth: {
				username: "foo",
				password: "test"
			}
		});
		expect(
			mergeConfig(
				{
					auth: {
						username: "foo",
						password: "test"
					}
				},
				{
					auth: {
						username: "baz",
						password: "foobar"
					}
				}
			)
		).toEqual({
			auth: {
				username: "baz",
				password: "foobar"
			}
		});
	});

	test("应该用非对象值覆盖 auth 和 headers", () => {
		expect(
			mergeConfig(
				{
					headers: {
						common: {
							Accept: "application/json, text/plain, */*"
						}
					}
				},
				{
					headers: null
				}
			)
		).toEqual({
			headers: null
		});
	});

	test("应该允许设置其他选项", () => {
		const merged = mergeConfig(defaults, {
			timeout: 123
		});
		expect(merged.timeout).toBe(123);
	});
});
