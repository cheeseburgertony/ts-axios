import axios, { AxiosResponse, AxiosError } from "../../src/index";
import { getAjaxRequest } from "../setup/helper";

describe("请求测试", () => {
	beforeEach(() => {
		jasmine.Ajax.install();
	});

	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	test("应该将单个字符串参数作为 URL 处理", () => {
		axios("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.url).toBe("/foo");
			expect(request.method).toBe("GET");
		});
	});

	test("应该将方法值转换为小写字符串", (done) => {
		axios({
			url: "/foo",
			method: "POST"
		}).then((response) => {
			expect(response.config.method).toBe("POST");
			done();
		});

		getAjaxRequest().then((request) => {
			request.respondWith({
				status: 200
			});
		});
	});

	test("应该在网络错误时拒绝请求", (done) => {
		const resolveSpy = jest.fn((res: AxiosResponse) => {
			return res;
		});

		const rejectSpy = jest.fn((e: AxiosError) => {
			return e;
		});

		jasmine.Ajax.uninstall();

		axios("/foo").then(resolveSpy).catch(rejectSpy).then(next);

		function next(reason: AxiosResponse | AxiosError) {
			expect(resolveSpy).not.toHaveBeenCalled();
			expect(rejectSpy).toHaveBeenCalled();
			expect(reason instanceof Error).toBeTruthy();
			expect((reason as AxiosError).message).toBe(
				"Request failed with status code 0"
			);
			expect(reason.request).toEqual(expect.any(XMLHttpRequest));

			jasmine.Ajax.install();

			done();
		}
	});

	test("应该在请求超时时拒绝请求", (done) => {
		let err: AxiosError;

		axios("/foo", {
			timeout: 2000,
			method: "post"
		}).catch((error) => {
			err = error;
		});

		getAjaxRequest().then((request) => {
			// @ts-expect-error - jasmine-ajax eventBus 类型定义缺失
			request.eventBus.trigger("timeout");

			setTimeout(() => {
				expect(err instanceof Error).toBeTruthy();
				expect(err.message).toBe("Timeout of 2000 ms exceeded");
				done();
			}, 100);
		});
	});

	test("应该在 validateStatus 返回 false 时拒绝请求", (done) => {
		const resolveSpy = jest.fn((res: AxiosResponse) => {
			return res;
		});

		const rejectSpy = jest.fn((e: AxiosError) => {
			return e;
		});

		axios("/foo", {
			validateStatus(status) {
				return status !== 500;
			}
		})
			.then(resolveSpy)
			.catch(rejectSpy)
			.then(next);

		getAjaxRequest().then((request) => {
			request.respondWith({
				status: 500
			});
		});

		function next(reason: AxiosError | AxiosResponse) {
			expect(resolveSpy).not.toHaveBeenCalled();
			expect(rejectSpy).toHaveBeenCalled();
			expect(reason instanceof Error).toBeTruthy();
			expect((reason as AxiosError).message).toBe(
				"Request failed with status code 500"
			);
			expect((reason as AxiosError).response!.status).toBe(500);

			done();
		}
	});

	test("应该在 validateStatus 返回 true 时解析请求", (done) => {
		const resolveSpy = jest.fn((res: AxiosResponse) => {
			return res;
		});

		const rejectSpy = jest.fn((e: AxiosError) => {
			return e;
		});

		axios("/foo", {
			validateStatus(status) {
				return status === 500;
			}
		})
			.then(resolveSpy)
			.catch(rejectSpy)
			.then(next);

		getAjaxRequest().then((request) => {
			request.respondWith({
				status: 500
			});
		});

		function next(res: AxiosResponse | AxiosError) {
			expect(resolveSpy).toHaveBeenCalled();
			expect(rejectSpy).not.toHaveBeenCalled();
			expect(res.config.url).toBe("/foo");

			done();
		}
	});

	test("应该在解析时返回 JSON 数据", (done) => {
		let response: AxiosResponse;

		axios("/api/account/signup", {
			auth: {
				username: "",
				password: ""
			},
			method: "post",
			headers: {
				Accept: "application/json"
			}
		}).then((res) => {
			response = res;
		});

		getAjaxRequest().then((request) => {
			request.respondWith({
				status: 200,
				statusText: "OK",
				responseText: '{"a": 1}'
			});

			setTimeout(() => {
				expect(response.data).toEqual({ a: 1 });
				done();
			}, 100);
		});
	});

	test("应该在拒绝时返回 JSON 数据", (done) => {
		let response: AxiosResponse;

		axios("/api/account/signup", {
			auth: {
				username: "",
				password: ""
			},
			method: "post",
			headers: {
				Accept: "application/json"
			}
		}).catch((error) => {
			response = error.response;
		});

		getAjaxRequest().then((request) => {
			request.respondWith({
				status: 400,
				statusText: "Bad Request",
				responseText: '{"error": "BAD USERNAME", "code": 1}',
				responseHeaders: {
					"Content-Type": "application/json"
				}
			});

			setTimeout(() => {
				const responseData = JSON.parse(response.data);
				expect(typeof responseData).toBe("object");
				expect(responseData.error).toBe("BAD USERNAME");
				expect(responseData.code).toBe(1);
				done();
			}, 100);
		});
	});

	test("应该提供正确的响应数据", (done) => {
		let response: AxiosResponse;

		axios.post("/foo").then((res) => {
			response = res;
		});

		getAjaxRequest().then((request) => {
			request.respondWith({
				status: 200,
				statusText: "OK",
				responseText: '{"foo": "bar"}',
				responseHeaders: {
					"Content-Type": "application/json"
				}
			});

			setTimeout(() => {
				expect(response.data.foo).toBe("bar");
				expect(response.status).toBe(200);
				expect(response.statusText).toBe("OK");
				expect(response.headers["content-type"]).toBe("application/json");
				done();
			}, 100);
		});
	});

	test("应该允许不区分大小写地覆盖 Content-Type 头", () => {
		let response: AxiosResponse;

		axios
			.post(
				"/foo",
				{ prop: "value" },
				{
					headers: {
						"content-type": "application/json"
					}
				}
			)
			.then((res) => {
				response = res;
			});

		return getAjaxRequest().then((request) => {
			expect(request.requestHeaders["Content-Type"]).toBe("application/json");
		});
	});

	test("应该支持 ArrayBuffer 响应", (done) => {
		let response: AxiosResponse;

		function str2ab(str: string) {
			const buff = new ArrayBuffer(str.length * 2);
			const view = new Uint16Array(buff);
			for (let i = 0; i < str.length; i++) {
				view[i] = str.charCodeAt(i);
			}
			return buff;
		}

		axios("/foo", {
			responseType: "arraybuffer"
		}).then((data) => {
			response = data;
		});

		getAjaxRequest().then((request) => {
			request.respondWith({
				status: 200,
				// @ts-expect-error - jasmine-ajax response 类型定义不完整
				response: str2ab("Hello world")
			});

			setTimeout(() => {
				expect(response.data.byteLength).toBe(22);
				done();
			}, 100);
		});
	});
});
