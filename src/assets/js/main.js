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
		const noteTextArea = new NoteTextArea({
			target: document.querySelector(".form__field-group--note"),
		});
	}
});
