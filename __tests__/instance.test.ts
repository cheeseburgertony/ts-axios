import axios, { AxiosRequestConfig, AxiosResponse } from "../src/index";
import { getAjaxRequest } from "./setup/helper";

describe("实例测试", () => {
	beforeEach(() => {
		jasmine.Ajax.install();
	});

	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	test("应该在没有动词辅助函数的情况下发起 HTTP 请求", () => {
		const instance = axios.create();

		instance("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.url).toBe("/foo");
		});
	});

	test("应该发起 HTTP 请求", () => {
		const instance = axios.create();

		instance.get("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.url).toBe("/foo");
			expect(request.method).toBe("GET");
		});
	});

	test("应该发起 POST 请求", () => {
		const instance = axios.create();

		instance.post("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.method).toBe("POST");
		});
	});

	test("应该发起 PUT 请求", () => {
		const instance = axios.create();

		instance.put("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.method).toBe("PUT");
		});
	});

	test("应该发起 PATCH 请求", () => {
		const instance = axios.create();

		instance.patch("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.method).toBe("PATCH");
		});
	});

	test("应该发起 OPTIONS 请求", () => {
		const instance = axios.create();

		instance.options("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.method).toBe("OPTIONS");
		});
	});

	test("应该发起 DELETE 请求", () => {
		const instance = axios.create();

		instance.delete("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.method).toBe("DELETE");
		});
	});

	test("应该发起 HEAD 请求", () => {
		const instance = axios.create();

		instance.head("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.method).toBe("HEAD");
		});
	});

	test("应该使用实例配置选项", () => {
		const instance = axios.create({ timeout: 1000 });

		instance.get("/foo");

		return getAjaxRequest().then((request) => {
			expect(request.timeout).toBe(1000);
		});
	});

	test("应该有 defaults.headers 属性", () => {
		const instance = axios.create({ baseURL: "https://api.example.com" });

		expect(typeof instance.defaults.headers).toBe("object");
		expect(typeof instance.defaults.headers.common).toBe("object");
	});

	test("应该在实例上有拦截器", (done) => {
		axios.interceptors.request.use((config) => {
			config.timeout = 2000;
			return config;
		});

		const instance = axios.create();

		instance.interceptors.request.use((config) => {
			config.withCredentials = true;
			return config;
		});

		let response: AxiosResponse;
		instance.get("/foo").then((res) => {
			response = res;
		});

		getAjaxRequest().then((request) => {
			request.respondWith({
				status: 200
			});

			setTimeout(() => {
				expect(response.config.timeout).toEqual(0);
				expect(response.config.withCredentials).toEqual(true);
				done();
			}, 100);
		});
	});

	test("应该获取计算后的 URI", () => {
		const fakeConfig: AxiosRequestConfig = {
			baseURL: "https://www.baidu.com/",
			url: "/user/12345",
			params: {
				idClient: 1,
				idTest: 2,
				testString: "thisIsATest"
			}
		};
		expect(axios.getUri(fakeConfig)).toBe(
			"https://www.baidu.com/user/12345?idClient=1&idTest=2&testString=thisIsATest"
		);
	});
});
