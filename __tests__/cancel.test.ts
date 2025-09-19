import axios from "../src/index";
import { getAjaxRequest } from "./helper";

describe("取消功能测试", () => {
	const CancelToken = axios.CancelToken;
	const Cancel = axios.Cancel;

	beforeEach(() => {
		jasmine.Ajax.install();
	});

	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	describe("在发送请求前调用取消", () => {
		test("应该用 Cancel 对象拒绝 Promise", () => {
			const source = CancelToken.source();
			source.cancel("Operation has been canceled.");

			return axios
				.get("/foo", {
					cancelToken: source.token
				})
				.catch((reason) => {
					expect(reason).toEqual(expect.any(Cancel));
					expect(reason.message).toBe("Operation has been canceled.");
				});
		});
	});

	describe("在请求发送后调用取消", () => {
		test("应该用 Cancel 对象拒绝 Promise", (done) => {
			const source = CancelToken.source();
			axios
				.get("/foo/bar", {
					cancelToken: source.token
				})
				.catch((reason) => {
					expect(reason).toEqual(expect.any(Cancel));
					expect(reason.message).toBe("Operation has been canceled.");
					done();
				});

			getAjaxRequest().then((request) => {
				source.cancel("Operation has been canceled.");
				setTimeout(() => {
					request.respondWith({
						status: 200,
						responseText: "OK"
					});
				}, 100);
			});
		});

		test("应该在请求对象上调用 abort", (done) => {
			const source = CancelToken.source();
			let request: any;
			axios
				.get("/foo/bar", {
					cancelToken: source.token
				})
				.catch(() => {
					expect(request.statusText).toBe("abort");
					done();
				});

			getAjaxRequest().then((req) => {
				source.cancel();
				request = req;
			});
		});
	});

	describe("在接收到响应后调用取消", () => {
		test("应该不会导致未处理的拒绝", (done) => {
			const source = CancelToken.source();
			axios
				.get("/foo", {
					cancelToken: source.token
				})
				.then(() => {
					window.addEventListener("unhandledrejection", () => {
						done.fail("Unhandled rejection.");
					});
					source.cancel();
					setTimeout(done, 100);
				});

			getAjaxRequest().then((request) => {
				request.respondWith({
					status: 200,
					responseText: "OK"
				});
			});
		});
	});
});
