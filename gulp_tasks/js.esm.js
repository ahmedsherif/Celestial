import { src, dest, watch } from "gulp";
const compiler = require("webpack");
const webpack = require("webpack-stream");

const js = () => {
	return src("./src/assets/js/main.js")
		.pipe(
			webpack(require("../webpack.config.js"), compiler, (err, stat) => {
				if (err) console.log(err);
				else if (stat.warnings && stat.warnings.length)
					console.log(stat.warnings);
				else if (stat.errors && stat.errors.length)
					console.log(stat.errors);
				else
					console.log(
						`[${new Date(stat.endTime)}]: JS bundle built.`
					);
			})
		)
		.pipe(dest("./assets/js/"));
};

const jsWatcher = () => {
	return watch("./src/assets/js/**/*.{js,jsx,svelte}", js);
};

export { js, jsWatcher };
