import { deepMerge, isPlainObject } from "../helper/util";
import { AxiosRequestConfig } from "../types";

const strats = Object.create(null);

export default function mergeConfig(
	config1: AxiosRequestConfig,
	config2?: AxiosRequestConfig
): AxiosRequestConfig {
	if (!config2) {
		config2 = {};
	}

	const defaultStrat = (val1: any, val2: any): any => {
		return typeof val2 !== "undefined" ? val2 : val1;
	};

	const fromVal2Strat = (val1: any, val2: any): any => {
		if (typeof val2 !== "undefined") {
			return val2;
		}
	};

	const deepMergeStrat = (val1: any, val2: any): any => {
		if (isPlainObject(val2)) {
			return deepMerge(val1, val2);
		} else if (typeof val2 !== "undefined") {
			return val2;
		} else if (isPlainObject(val1)) {
			return deepMerge(val1);
		} else {
			return val1;
		}
	};

	const stratKeysFromVal2 = ["url", "params", "data"];
	const stratKeyDeepMerge = ["headers", "auth"];

	stratKeysFromVal2.forEach((key) => {
		strats[key] = fromVal2Strat;
	});

	stratKeyDeepMerge.forEach((key) => {
		strats[key] = deepMergeStrat;
	});

	const config = Object.create(null);

	for (const key in config2) {
		mergeFiled(key);
	}

	for (const key in config1) {
		if (!config2[key]) {
			mergeFiled(key);
		}
	}

	function mergeFiled(key: string): void {
		const strat = strats[key] || defaultStrat;
		config[key] = strat(config1[key], config2![key]);
	}

	return config;
}
