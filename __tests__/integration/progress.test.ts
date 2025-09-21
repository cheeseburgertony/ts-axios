import axios from "../../src/index";
import { getAjaxRequest } from "../setup/helper";

describe("进度监听测试", () => {
	beforeEach(() => {
		jasmine.Ajax.install();
	});

	afterEach(() => {
		jasmine.Ajax.uninstall();
	});

	test("应该添加下载进度处理器", () => {
		const progressSpy = jest.fn();

		axios("/foo", { onDownloadProgress: progressSpy });

		return getAjaxRequest().then((request) => {
			request.respondWith({
				status: 200,
				responseText: '{"foo": "bar"}'
			});
			expect(progressSpy).toHaveBeenCalled();
		});
	});

	test("应该添加上传进度处理器", () => {
		const progressSpy = jest.fn();

		axios("/foo", { onUploadProgress: progressSpy });

		return getAjaxRequest().then((request) => {
			// Jasmine AJAX 不会触发上传事件，等待 jest-ajax 修复
			// expect(progressSpy).toHaveBeenCalled()
		});
	});
});
