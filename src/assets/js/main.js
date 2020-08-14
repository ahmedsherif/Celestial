import { emoji } from "./emoji";
import { userMenu, activeNavigation } from "./navigation";
import { setTimeZone } from "./forms";
import NoteTextArea from "./components/NoteTextArea.svelte";

window.addEventListener("DOMContentLoaded", () => {
	emoji();
	activeNavigation();
	userMenu();
	setTimeZone();

	if (!!document.querySelector(".form__field-group--note")) {
		let required = false;
		if (document.querySelector(".publishing-form--note")) {
			required = true;
		}
		const noteTextArea = new NoteTextArea({
			target: document.querySelector(".form__field-group--note"),
			props: {
				required,
			},
		});
	}
});
