import ReactDOM from "react-dom";
import React from "react";

import { emoji } from "./emoji";
import { userMenu, activeNavigation } from "./navigation";
import { setTimeZone } from "./forms";

import NoteTextArea from "./components/NoteTextArea.svelte";
import MediaUpload from "./components/MediaUpload.jsx";

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

	if (!!document.querySelector(".form-container--media")) {
		ReactDOM.render(
			<MediaUpload />,
			document.querySelector(".form-container--media")
		);
	}
});
