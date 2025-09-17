import { transformRequest } from "./helper/data";
import { buildURL } from "./helper/url";
import { AxiosRequestConfig } from "./types";
import xhr from "./xhr";

function axios(config: AxiosRequestConfig): void {
	processConfig(config);
	xhr(config);
}

const processConfig = (config: AxiosRequestConfig): void => {
	config.url = transformURL(config);
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

export default axios;
