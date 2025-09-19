import { isDate, isPlainObject } from "./util";

interface URLOrigin {
	protocol: string;
	host: string;
}

const encode = (val: string): string => {
	return encodeURIComponent(val)
		.replace(/%40/g, "@")
		.replace(/%3A/gi, ":")
		.replace(/%24/g, "$")
		.replace(/%2C/gi, ",")
		.replace(/%20/g, "+")
		.replace(/%5B/gi, "[")
		.replace(/%5D/gi, "]");
};

export const buildURL = (url: string, params?: any): string => {
	if (!params) {
		return url;
	}

	const parts: string[] = [];
	Object.keys(params).forEach((key) => {
		const val = params[key];
		if (val === null || typeof val === "undefined") {
			return;
		}
		let values = [];
		if (Array.isArray(val)) {
			values = val;
			key += "[]";
		} else {
			values = [val];
		}

		values.forEach((value) => {
			if (isDate(value)) {
				value = value.toISOString();
			} else if (isPlainObject(value)) {
				value = JSON.stringify(value);
			}
			parts.push(`${encode(key)}=${encode(value)}`);
		});
	});

	let serializedParams = parts.join("&");

	if (serializedParams) {
		const markIndex = url.indexOf("#");
		if (markIndex !== -1) {
			url = url.slice(0, markIndex);
		}
		url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
	}

	return url;
};

export const isURLSameOrigin = (requestURL: string): boolean => {
	const parsedOrigin = resolveURL(requestURL);
	return (
		parsedOrigin.protocol === currentOrigin.protocol &&
		parsedOrigin.host === currentOrigin.host
	);
};

const urlParsingNode = document.createElement("a");
const currentOrigin = resolveURL(window.location.href);

function resolveURL(url: string): URLOrigin {
	urlParsingNode.setAttribute("href", url);
	const { protocol, host } = urlParsingNode;

	return {
		protocol,
		host
	};
}
