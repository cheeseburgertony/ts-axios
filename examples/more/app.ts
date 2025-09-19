import axios from "../../src/index";
import 'nprogress/nprogress.css'
import NProgress from "nprogress";

// document.cookie = "a=b";

// axios.get("/more/get").then((res) => {
// 	console.log(res);
// });

// axios
// 	.post(
// 		"http://127.0.0.1:8088/more/server2",
// 		{},
// 		{
// 			withCredentials: true
// 		}
// 	)
// 	.then((res) => {
// 		console.log(res);
// 	});

// const instance = axios.create({
// 	xsrfCookieName: "XSRF-TOKEN-D",
// 	xsrfHeaderName: "X-XSRF-TOKEN-D"
// });

// instance.get("/more/get").then((res) => {
// 	console.log(res);
// });

const instance = axios.create();

function calculatePercentage(loaded: number, total: number) {
	return Math.floor(loaded * 1.0) / total;
}

function loadProgressBar() {
	const setupStartProgress = () => {
		instance.interceptors.request.use((config) => {
			NProgress.start();
			return config;
		});
	};

	const setupUpdateProgress = () => {
		const update = (e: ProgressEvent) => {
			console.log(e);
			NProgress.set(calculatePercentage(e.loaded, e.total));
		};
		instance.defaults.onDownloadProgress = update;
		instance.defaults.onUploadProgress = update;
	};

	const setupStopProgress = () => {
		instance.interceptors.response.use(
			(response) => {
				NProgress.done();
				return response;
			},
			(error) => {
				NProgress.done();
				return Promise.reject(error);
			}
		);
	};

	setupStartProgress();
	setupUpdateProgress();
	setupStopProgress();
}

loadProgressBar();

const downloadEl = document.getElementById("download") as HTMLElement;

downloadEl.addEventListener("click", (e) => {
	instance.get(
		"https://miaobi-lite.bj.bcebos.com/miaobi/5mao/b%27LV8xNzMzNDUyNjUyLjcyOTc3Ng%3D%3D%27/0.png"
	);
});

const uploadEl = document.getElementById("upload") as HTMLElement;

uploadEl.addEventListener("click", (e) => {
	const data = new FormData();
	const fileEl = document.getElementById("file") as HTMLInputElement;
	if (fileEl.files) {
		data.append("file", fileEl.files[0]);

		instance.post("/more/upload", data);
	}
});
