import axios from "../src/index";
import { getAjaxRequest } from "./setup/helper";

describe("XSRF 防护测试", () => {
	beforeEach(() => {
		jasmine.Ajax.install();
	});

	afterEach(() => {
		jasmine.Ajax.uninstall();
		document.cookie =
			axios.defaults.xsrfCookieName +
			"=;expires=" +
			new Date(Date.now() - 86400000).toUTCString();
	});

	test("应该在 cookie 为空时不设置 XSRF 请求头", () => {
		axios("/foo");

		return getAjaxRequest().then((request) => {
			expect(
				request.requestHeaders[axios.defaults.xsrfHeaderName!]
			).toBeUndefined();
		});
	});

	test("应该在 cookie 存在时设置 XSRF 请求头", () => {
		document.cookie = axios.defaults.xsrfCookieName + "=12345";

		axios("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.requestHeaders[axios.defaults.xsrfHeaderName!]).toBe(
				"12345"
			);
		});
	});

	test("应该在跨域请求时不设置 XSRF 请求头", () => {
		document.cookie = axios.defaults.xsrfCookieName + "=12345";

		axios("http://example.com/");

		return getAjaxRequest().then((request) => {
			expect(
				request.requestHeaders[axios.defaults.xsrfHeaderName!]
			).toBeUndefined();
		});
	});

	test("应该在跨域请求使用 withCredentials 时设置 XSRF 请求头", () => {
		document.cookie = axios.defaults.xsrfCookieName + "=12345";

		axios("http://example.com/", {
			withCredentials: true
		});

		return getAjaxRequest().then((request) => {
			expect(request.requestHeaders[axios.defaults.xsrfHeaderName!]).toBe(
				"12345"
			);
		});
	});
});
