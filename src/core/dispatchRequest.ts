import { transformRequest, transformResponse } from "../helper/data";
import { processHeaders } from "../helper/headers";
import { buildURL } from "../helper/url";
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "../types";
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
	config.headers = transformHeaders(config);
	config.data = transformRequestData(config);
};

const transformURL = (config: AxiosRequestConfig): string => {
	const { url, params } = config;
	return buildURL(url, params);
};

const transformRequestData = (config: AxiosRequestConfig): any => {
	const { data } = config;
	return transformRequest(data);
};

const transformHeaders = (config: AxiosRequestConfig): any => {
	const { headers = {}, data } = config;
	return processHeaders(headers, data);
};

const transformResponseData = (res: AxiosResponse): AxiosResponse => {
	res.data = transformResponse(res.data);
	return res;
};
