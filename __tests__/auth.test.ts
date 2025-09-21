import axios from "../src/index";
import { getAjaxRequest } from "./setup/helper";

describe("身份验证测试", () => {
	beforeEach(() => {
		jasmine.Ajax.install();
	});

	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	test("应该接受用户名和密码的 HTTP Basic 认证", () => {
		axios("/foo", {
			auth: {
				username: "Aladdin",
				password: "open sesame"
			}
		});

		return getAjaxRequest().then((request) => {
			expect(request.requestHeaders["Authorization"]).toBe(
				"Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=="
			);
		});
	});

	test("应该在认证凭据包含非 Latin1 字符时编码失败", () => {
		return axios("/foo", {
			auth: {
				username: "Aladßç£☃din",
				password: "open sesame"
			}
		})
			.then(() => {
				throw new Error(
					"在认证凭据包含非 Latin1 字符时不应该成功发起 HTTP Basic 认证请求。"
				);
			})
			.catch((error) => {
				expect(/character/i.test(error.message)).toBeTruthy();
			});
	});
});
