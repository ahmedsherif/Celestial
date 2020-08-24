import { series, parallel } from "gulp";

// Tasks
import { css, cssWatcher } from "./gulp_tasks/css.esm";
import { js, jsWatcher } from "./gulp_tasks/js.esm";
import { minifyImg as img, imgWatcher } from "./gulp_tasks/img.esm";

// Env tasks
export const development = series(
	parallel(js, css, img),
	parallel(jsWatcher, cssWatcher, imgWatcher)
);
export const production = parallel(js, css, img);
