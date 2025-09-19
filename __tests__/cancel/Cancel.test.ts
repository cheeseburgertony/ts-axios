import Cancel, { isCancel } from "../../src/cancel/Cancel";

describe("取消功能:Cancel", () => {
	test("应该在指定消息时返回正确结果", () => {
		const cancel = new Cancel("Operation has been canceled.");
		expect(cancel.message).toBe("Operation has been canceled.");
	});

	test("应该在值是 Cancel 实例时返回 true", () => {
		expect(isCancel(new Cancel())).toBeTruthy();
	});

	test("应该在值不是 Cancel 实例时返回 false", () => {
		expect(isCancel({ foo: "bar" })).toBeFalsy();
	});
});
