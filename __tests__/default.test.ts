import axios, { AxiosTransformer } from "../src/index";
import { getAjaxRequest } from "./setup/helper";
import { deepMerge } from "../src/helper/util";

describe("默认配置测试", () => {
	beforeEach(() => {
		jasmine.Ajax.install();
	});

	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	test("应该转换请求中的 JSON 数据", () => {
		expect(
			(axios.defaults.transformRequest as AxiosTransformer[])[0]({ foo: "bar" })
		).toBe('{"foo":"bar"}');
	});

	test("应该对请求字符串不做处理", () => {
		expect(
			(axios.defaults.transformRequest as AxiosTransformer[])[0]("foo=bar")
		).toBe("foo=bar");
	});

	test("应该转换响应中的 JSON 数据", () => {
		const data = (axios.defaults.transformResponse as AxiosTransformer[])[0](
			'{"foo":"bar"}'
		);

		expect(typeof data).toBe("object");
		expect(data.foo).toBe("bar");
	});

	test("应该对响应字符串不做处理", () => {
		expect(
			(axios.defaults.transformResponse as AxiosTransformer[])[0]("foo=bar")
		).toBe("foo=bar");
	});

	test("应该使用全局默认配置", () => {
		axios("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.url).toBe("/foo");
		});
	});

	test("应该使用修改后的默认配置", () => {
		axios.defaults.baseURL = "http://example.com/";

		axios("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.url).toBe("http://example.com/foo");
			delete axios.defaults.baseURL;
		});
	});

	test("应该使用请求配置", () => {
		axios("/foo", {
			baseURL: "http://www.example.com"
		});

		return getAjaxRequest().then((request) => {
			expect(request.url).toBe("http://www.example.com/foo");
		});
	});

	test("应该为自定义实例使用默认配置", () => {
		const instance = axios.create({
			xsrfCookieName: "CUSTOM-XSRF-TOKEN",
			xsrfHeaderName: "X-CUSTOM-XSRF-TOKEN"
		});
		document.cookie = instance.defaults.xsrfCookieName + "=foobarbaz";

		instance.get("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.requestHeaders[instance.defaults.xsrfHeaderName!]).toBe(
				"foobarbaz"
			);
			document.cookie =
				instance.defaults.xsrfCookieName +
				"=;expires=" +
				new Date(Date.now() - 86400000).toUTCString();
		});
	});

	test("应该使用 GET 请求头", () => {
		axios.defaults.headers.get["X-CUSTOM-HEADER"] = "foo";
		axios.get("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.requestHeaders["X-CUSTOM-HEADER"]).toBe("foo");
			delete axios.defaults.headers.get["X-CUSTOM-HEADER"];
		});
	});

	test("应该使用 POST 请求头", () => {
		axios.defaults.headers.post["X-CUSTOM-HEADER"] = "foo";
		axios.post("/foo", {});

		return getAjaxRequest().then((request) => {
			expect(request.requestHeaders["X-CUSTOM-HEADER"]).toBe("foo");
			delete axios.defaults.headers.post["X-CUSTOM-HEADER"];
		});
	});

	test("应该使用请求头配置", () => {
		const instance = axios.create({
			headers: {
				common: {
					"X-COMMON-HEADER": "commonHeaderValue"
				},
				get: {
					"X-GET-HEADER": "getHeaderValue"
				},
				post: {
					"X-POST-HEADER": "postHeaderValue"
				}
			}
		});

		instance.get("/foo", {
			headers: {
				"X-FOO-HEADER": "fooHeaderValue",
				"X-BAR-HEADER": "barHeaderValue"
			}
		});

		return getAjaxRequest().then((request) => {
			expect(request.requestHeaders).toEqual(
				deepMerge(axios.defaults.headers.common, axios.defaults.headers.get, {
					"X-COMMON-HEADER": "commonHeaderValue",
					"X-GET-HEADER": "getHeaderValue",
					"X-FOO-HEADER": "fooHeaderValue",
					"X-BAR-HEADER": "barHeaderValue"
				})
			);
		});
	});

	test("应该被在实例创建前设置的自定义实例使用", () => {
		axios.defaults.baseURL = "http://example.org/";
		const instance = axios.create();

		instance.get("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.url).toBe("http://example.org/foo");
			delete axios.defaults.baseURL;
		});
	});

	test("应该不被在实例创建后设置的自定义实例使用", () => {
		const instance = axios.create();
		axios.defaults.baseURL = "http://example.org/";

		instance.get("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.url).toBe("/foo");
		});
	});
});
