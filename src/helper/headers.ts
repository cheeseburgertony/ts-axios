import { Method } from "../types";
import { deepMerge, isPlainObject } from "./util";

const normalizeHeaderName = (headers: any, normalizedName: string): void => {
	if (!headers) {
		return;
	}
	Object.keys(headers).forEach((name) => {
		if (
			name !== normalizedName &&
			name.toUpperCase() === normalizedName.toUpperCase()
		) {
			headers[normalizedName] = headers[name];
			delete headers[name];
		}
	});
};

export const processHeaders = (headers: any, data: any): any => {
	normalizeHeaderName(headers, "Content-Type");
	if (isPlainObject(data)) {
		if (headers && !headers["Content-Type"]) {
			headers["Content-Type"] = "application/json;charset=utf-8";
		}
	}
	return headers;
};

export const parseHeaders = (headers: string): any => {
	let parsed = Object.create(null);

	headers.split("\r\n").forEach((line) => {
		const colonIndex = line.indexOf(":");
		if (colonIndex === -1) {
			return;
		}
		let key = line.substring(0, colonIndex).trim().toLocaleLowerCase();
		let value = line.substring(colonIndex + 1);
		if (!key) {
			return;
		}
		if (value) {
			value = value.trim();
		}
		parsed[key] = value;
	});
	return parsed;
};

export const flattenHeaders = (headers: any, method: Method): any => {
	if (!headers) {
		return headers;
	}

	headers = deepMerge(headers.common || {}, headers[method] || {}, headers);

	const methodsToDelete = [
		"delete",
		"get",
		"options",
		"head",
		"post",
		"put",
		"patch",
		"common"
	];

	methodsToDelete.forEach((method) => {
		delete headers[method];
	});

	return headers;
};
