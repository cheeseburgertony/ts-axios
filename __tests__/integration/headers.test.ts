import axios from "../../src/index";
import { getAjaxRequest } from "../setup/helper";

function testHeaderValue(headers: any, key: string, val?: string): void {
	let found = false;

	for (let k in headers) {
		if (k.toLowerCase() === key.toLowerCase()) {
			found = true;
			expect(headers[k]).toBe(val);
			break;
		}
	}

	if (!found) {
		if (typeof val === "undefined") {
			expect(Object.prototype.hasOwnProperty.call(headers, key)).toBeFalsy();
		} else {
			throw new Error(key + " was not found in headers");
		}
	}
}

describe("请求头测试", () => {
	beforeEach(() => {
		jasmine.Ajax.install();
	});

	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	test("应该使用默认的通用请求头", () => {
		const headers = axios.defaults.headers.common;

		axios("/foo");

		return getAjaxRequest().then((request) => {
			for (let key in headers) {
				if (Object.prototype.hasOwnProperty.call(headers, key)) {
					expect(request.requestHeaders[key]).toEqual(headers[key]);
				}
			}
		});
	});

	test("应该为 POST 请求添加额外的请求头", () => {
		axios.post("/foo", "fizz=buzz");

		return getAjaxRequest().then((request) => {
			testHeaderValue(
				request.requestHeaders,
				"Content-Type",
				"application/x-www-form-urlencoded"
			);
		});
	});

	test("应该在发送对象时使用 application/json", () => {
		axios.post("/foo/bar", {
			firstName: "foo",
			lastName: "bar"
		});

		return getAjaxRequest().then((request) => {
			testHeaderValue(
				request.requestHeaders,
				"Content-Type",
				"application/json;charset=utf-8"
			);
		});
	});

	test("应该在数据为空时移除 content-type", () => {
		axios.post("/foo");

		return getAjaxRequest().then((request) => {
			testHeaderValue(request.requestHeaders, "Content-Type", undefined);
		});
	});

	test("应该在数据为 false 时保留 content-type", () => {
		axios.post("/foo", false);

		return getAjaxRequest().then((request) => {
			testHeaderValue(
				request.requestHeaders,
				"Content-Type",
				"application/x-www-form-urlencoded"
			);
		});
	});

	test("应该在数据为 FormData 时移除 content-type", () => {
		const data = new FormData();
		data.append("foo", "bar");

		axios.post("/foo", data);

		return getAjaxRequest().then((request) => {
			testHeaderValue(request.requestHeaders, "Content-Type", undefined);
		});
	});
});
