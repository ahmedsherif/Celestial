<script>
	const goodLength = 158;
	let text = "";
	let userCharacterCount = 0;

	$: userCharacterCount = text.length;
</script>

<label for="summary">Summary:</label>
<p class="field-group__description" id="field-group__description--summary">
	For good search result rankings, please do not abuse keywords and try to
	keep the character count below {goodLength} characters. Use this as summary on blog index pages and/or as meta descriptions for search engines.
</p>

<p
	class="publishing-form__character-count {userCharacterCount > goodLength ? 'publishing-form__character-count--warning' : ''}"
>
	{userCharacterCount} / {goodLength} {#if userCharacterCount ===
	1}character{:else}characters{/if}
</p>
<textarea
	bind:value="{text}"
	name="p-summary"
	id="summary"
	cols="30"
	rows="4"
	aria-describedby="field-group__description--summary"
></textarea>
