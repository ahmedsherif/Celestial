import { emoji } from "./emoji";
import { userMenu, activeNavigation } from "./navigation";
import { setTimeZone } from "./forms";
import ContentTextArea from "./components/ContentTextArea.svelte";
import Categories from "./components/Categories.svelte";

window.addEventListener("DOMContentLoaded", () => {
	emoji();
	activeNavigation();
	userMenu();
	setTimeZone();

	if (!!document.querySelector(".field-group--content")) {
		let required = false;
		if (document.querySelector(".publishing-form--note")) required = true;
		const content = new ContentTextArea({
			target: document.querySelector(".field-group--content"),
			props: {
				required,
			},
		});
	}

	if (!!document.querySelector(".fieldset--category")) {
		const categoriesInput = new Categories({
			target: document.querySelector(".fieldset--category"),
		});
	}
});
