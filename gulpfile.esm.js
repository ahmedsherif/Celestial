import { series, parallel } from "gulp";

// Tasks
import { css, cssPurgeMin, cssWatcher } from "./gulp_tasks/css.esm";
import { js, jsWatcher } from "./gulp_tasks/js.esm";
import { minifyImg as img, imgWatcher } from "./gulp_tasks/img.esm";

// Env tasks
export const development = parallel(js, css, img);
export const production = series(
	development,
	cssPurgeMin,
	parallel(jsWatcher, cssWatcher, imgWatcher)
);
