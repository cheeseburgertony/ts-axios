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
