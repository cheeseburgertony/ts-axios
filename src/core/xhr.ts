import cookie from "../helper/cookie";
import { createError } from "../helper/error";
import { parseHeaders } from "../helper/headers";
import { isURLSameOrigin } from "../helper/url";
import { isFormData } from "../helper/util";
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "../types";

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
	return new Promise((resolve, reject) => {
		const {
			data = null,
			url,
			method = "get",
			headers,
			responseType,
			timeout,
			cancelToken,
			withCredentials,
			xsrfCookieName,
			xsrfHeaderName,
			onDownloadProgress,
			onUploadProgress,
			auth
		} = config;
		const request = new XMLHttpRequest();
		let isAborted = false;

		request.open(method.toUpperCase(), url!, true);

		configRequest();
		addEvents();
		processHeaders();
		processCancel();

		request.send(data);

		function configRequest(): void {
			if (responseType) {
				request.responseType = responseType;
			}

			if (timeout) {
				request.timeout = timeout;
			}

			if (withCredentials) {
				request.withCredentials = withCredentials;
			}
		}

		function addEvents(): void {
			request.onreadystatechange = function handleLoad() {
				if (request.readyState !== 4) {
					return;
				}
				if (isAborted) {
					return;
				}

				const responseHeaders = parseHeaders(request.getAllResponseHeaders());
				const responseData =
					responseType && responseType !== "text"
						? request.response
						: request.responseText;
				const response: AxiosResponse = {
					data: responseData,
					status: request.status,
					statusText: request.statusText,
					headers: responseHeaders,
					config,
					request
				};
				handleResponse(response);
			};

			request.onerror = function handleError() {
				reject(createError("Network Error", config, null, request));
			};

			request.ontimeout = function handleTimeout() {
				reject(
					createError(
						`Timeout of ${timeout} ms exceeded`,
						config,
						"ECONNABORTED",
						request
					)
				);
			};

			if (onDownloadProgress) {
				request.onprogress = onDownloadProgress;
			}

			if (onUploadProgress) {
				request.upload.onprogress = onUploadProgress;
			}
		}

		function processHeaders(): void {
			if (auth) {
				headers["Authorization"] =
					"Basic " + btoa(auth.username + ":" + auth.password);
			}

			if (isFormData(data)) {
				delete headers["Content-Type"];
			}

			if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
				const xsrfValue = cookie.read(xsrfCookieName);
				if (xsrfValue) {
					headers[xsrfHeaderName!] = xsrfValue;
				}
			}

			Object.keys(headers).forEach((name) => {
				if (data === null && name.toLowerCase() === "content-type") {
					delete headers[name];
				} else {
					request.setRequestHeader(name, headers[name]);
				}
			});
		}

		function processCancel(): void {
			if (cancelToken) {
				cancelToken.promise.then((reason) => {
					isAborted = true;
					request.abort();
					reject(reason);
				});
			}
		}

		function handleResponse(response: AxiosResponse) {
			if (response.status >= 200 && response.status < 300) {
				resolve(response);
			} else {
				reject(
					createError(
						`Request failed with status code ${response.status}`,
						config,
						null,
						request,
						response
					)
				);
			}
		}
	});
}
