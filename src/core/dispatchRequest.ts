import { flattenHeaders } from "../helper/headers";
import { buildURL } from "../helper/url";
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "../types";
import transform from "./transform";
import xhr from "./xhr";

export default function dispatchRequest(
	config: AxiosRequestConfig
): AxiosPromise {
	processConfig(config);
	return xhr(config).then((res) => {
		return transformResponseData(res);
	});
}

const processConfig = (config: AxiosRequestConfig): void => {
	config.url = transformURL(config);
	config.data = transform(config.data, config.headers, config.transformRequest);
	config.headers = flattenHeaders(config.headers, config.method!);
};

const transformURL = (config: AxiosRequestConfig): string => {
	const { url, params } = config;
	return buildURL(url!, params);
};

const transformResponseData = (res: AxiosResponse): AxiosResponse => {
	res.data = transform(res.data, res.headers, res.config.transformResponse);
	return res;
};
