import Axios from "./core/Axios";
import { extend } from "./helper/util";
import { AxiosInstance } from "./types";

const createInstance = (): AxiosInstance => {
	const context = new Axios();
	const instance = Axios.prototype.request.bind(context);

	extend(instance, context);

	return instance as AxiosInstance;
};

const axios = createInstance();

export default axios;
