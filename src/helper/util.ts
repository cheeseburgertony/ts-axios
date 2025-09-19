const toString = Object.prototype.toString;

export const isDate = (val: any): val is Date => {
	return toString.call(val) === "[object Date]";
};

// export const isObject = (val: any): val is object => {
// 	return val !== null && typeof val === "object";
// };

export const isPlainObject = (val: any): val is object => {
	return toString.call(val) === "[object Object]";
};

export const isFormData = (val: any): boolean => {
	return typeof val !== "undefined" && val instanceof FormData;
};

export const isURLSearchParams = (val: any): val is URLSearchParams => {
	return typeof val !== "undefined" && val instanceof URLSearchParams;
};

export function extend<T, U>(to: T, from: U): T & U {
	for (const key in from) {
		(to as T & U)[key] = from[key] as any;
	}

	// 复制原型上的方法
	if (from && typeof from === "object") {
		const proto = Object.getPrototypeOf(from);
		if (proto) {
			Object.getOwnPropertyNames(proto).forEach((key) => {
				if (
					key !== "constructor" &&
					typeof (proto as any)[key] === "function"
				) {
					(to as any)[key] = (proto as any)[key].bind(from);
				}
			});
		}
	}

	return to as T & U;
}

export const deepMerge = (...objs: any[]): any => {
	const result = Object.create(null);

	objs.forEach((obj) => {
		if (obj) {
			Object.keys(obj).forEach((key) => {
				const val = obj[key];
				if (isPlainObject(val)) {
					if (isPlainObject(result[key])) {
						result[key] = deepMerge(result[key], val);
					} else {
						result[key] = deepMerge({}, val);
					}
				} else {
					result[key] = val;
				}
			});
		}
	});

	return result;
};
