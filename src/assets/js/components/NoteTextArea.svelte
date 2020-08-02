<script>
	let text = "";
	let twitterLength = 280,
		mastodonLength = 500;
	$: textLength = text.length;
</script>

<label for="note">Note:</label>
<p
    class="form-field-group__description"
    id="form-field-group__description--note"
>You may write markdown here depending on how the data sent by the Micropub server to your websie is processed. It may also be possible that your Micropub server sends formatted content to your website. Please consult your server documentation.</p>

<p class="publishing-form__character-count">
	{#if textLength < twitterLength} {textLength} / {twitterLength} {:else if
	textLength < mastodonLength} {textLength} / {mastodonLength} {:else}
	{textLength} {/if} {#if textLength === 1} character {:else} characters {/if}
</p>
<textarea
	bind:value="{text}"
	name="note"
	id="note"
	cols="30"
	rows="16"
	aria-describedby="form-field-group__description--note"
	required
></textarea>
