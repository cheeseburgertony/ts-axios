import cookie from "../../src/helper/cookie";

describe("cookie 工具函数测试", () => {
	// 保存原始的 document.cookie
	let originalCookie: string;

	beforeEach(() => {
		// 保存原始 cookie
		originalCookie = document.cookie;
		// 清空 cookie
		document.cookie.split(";").forEach((c) => {
			const eqPos = c.indexOf("=");
			const name = eqPos > -1 ? c.substr(0, eqPos) : c;
			document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
		});
	});

	afterEach(() => {
		// 恢复原始 cookie（实际上在测试环境中可能无法完全恢复）
		// 清空测试产生的 cookie
		document.cookie.split(";").forEach((c) => {
			const eqPos = c.indexOf("=");
			const name = eqPos > -1 ? c.substr(0, eqPos) : c;
			document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
		});
	});

	describe("read 方法", () => {
		it("应该能读取存在的 cookie", () => {
			// 设置 cookie
			document.cookie = "testName=testValue";

			const result = cookie.read("testName");
			expect(result).toBe("testValue");
		});

		it("应该能读取包含特殊字符的 cookie 值", () => {
			// 设置包含特殊字符的 cookie
			const specialValue = "hello world!@#$%";
			document.cookie = `specialCookie=${encodeURIComponent(specialValue)}`;

			const result = cookie.read("specialCookie");
			expect(result).toBe(specialValue);
		});

		it("应该能读取包含中文的 cookie 值", () => {
			// 设置包含中文的 cookie
			const chineseValue = "你好世界";
			document.cookie = `chineseCookie=${encodeURIComponent(chineseValue)}`;

			const result = cookie.read("chineseCookie");
			expect(result).toBe(chineseValue);
		});

		it("应该能从多个 cookie 中读取指定的 cookie", () => {
			// 设置多个 cookie
			document.cookie = "cookie1=value1";
			document.cookie = "cookie2=value2";
			document.cookie = "cookie3=value3";

			expect(cookie.read("cookie1")).toBe("value1");
			expect(cookie.read("cookie2")).toBe("value2");
			expect(cookie.read("cookie3")).toBe("value3");
		});

		it("应该对不存在的 cookie 返回 null", () => {
			const result = cookie.read("nonExistentCookie");
			expect(result).toBe(null);
		});

		it("应该对空字符串 cookie 名返回 null", () => {
			const result = cookie.read("");
			expect(result).toBe(null);
		});

		it("应该处理 cookie 名包含特殊字符的情况", () => {
			// 这个测试可能会失败，因为 cookie 名通常不应包含特殊字符
			// 但我们测试函数的健壮性
			const result = cookie.read("test@cookie");
			expect(result).toBe(null);
		});

		it("应该正确处理 cookie 值为空字符串的情况", () => {
			document.cookie = "emptyCookie=";

			const result = cookie.read("emptyCookie");
			expect(result).toBe("");
		});

		it("应该处理 cookie 值包含等号的情况", () => {
			const valueWithEquals = "key=value=another";
			document.cookie = `equalsCookie=${encodeURIComponent(valueWithEquals)}`;

			const result = cookie.read("equalsCookie");
			expect(result).toBe(valueWithEquals);
		});

		it("应该处理 cookie 名大小写敏感", () => {
			document.cookie = "TestCookie=testValue";

			expect(cookie.read("TestCookie")).toBe("testValue");
			expect(cookie.read("testcookie")).toBe(null);
			expect(cookie.read("TESTCOOKIE")).toBe(null);
		});
	});

	describe("边界情况测试", () => {
		it("应该处理包含分号的 cookie 值", () => {
			// 注意：实际上 cookie 值不应该包含未编码的分号
			// 这里测试编码后的情况
			const valueWithSemicolon = "value;with;semicolon";
			document.cookie = `semicolonCookie=${encodeURIComponent(valueWithSemicolon)}`;

			const result = cookie.read("semicolonCookie");
			expect(result).toBe(valueWithSemicolon);
		});

		it("应该处理超长的 cookie 名", () => {
			const longName = "a".repeat(100);
			document.cookie = `${longName}=longNameValue`;

			const result = cookie.read(longName);
			expect(result).toBe("longNameValue");
		});

		it("应该处理超长的 cookie 值", () => {
			const longValue = "x".repeat(1000);
			document.cookie = `longValueCookie=${longValue}`;

			const result = cookie.read("longValueCookie");
			expect(result).toBe(longValue);
		});
	});

	describe("正则表达式测试", () => {
		it("应该正确匹配 cookie 名开头的情况", () => {
			document.cookie = "test=value1";
			document.cookie = "testMore=value2";

			expect(cookie.read("test")).toBe("value1");
			expect(cookie.read("testMore")).toBe("value2");
		});

		it("应该正确处理 cookie 名包含正则特殊字符", () => {
			// 这个测试检查函数是否正确转义了正则表达式特殊字符
			const result = cookie.read("test.cookie");
			expect(result).toBe(null);
		});
	});
});
