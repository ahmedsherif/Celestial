<script>
	import { onMount } from "svelte";

	let categories = [];
	$: userEnteredCategories = [];
	let currentCategoryName = "";

	onMount(async () => {
		const response = await fetch(
			"/api/v1/micropub/category/"
		).catch((error) => console.error(error));

		const data = await response
			.json()
			.catch((error) => console.error(error));

		if (data && data.error) console.error(data.error_description);
		else categories = data;
	});

	const handleKeyUp = (event) => {
		if (event.code === "Comma") {
			if (currentCategoryName.length > 1) {
				// Prevent people from trying to enter a comma for a category input
				userEnteredCategories = [
					...userEnteredCategories,
					currentCategoryName.slice(0, -1),
				];
				currentCategoryName = "";
			}
		}
	};

	const deleteUserCategory = (event) => {
		userEnteredCategories = userEnteredCategories.filter((cat) =>
			event.target.dataset.value === cat ? false : true
		);
	};
</script>

<input
	type="text"
	id="field-group__category"
	aria-describedby="field-group__description--category"
	list="category--suggestions"
	on:keyup|preventDefault={handleKeyUp}
	bind:value="{currentCategoryName}"
	aria-controls="category--user"
/>

<datalist class="category" id="category--suggestions">
	{#each categories as category}
	<option value="{category}">{category}</option>
	{/each}
</datalist>

<!-- To avoid handling the form manually just for categories, we build a list of checkboxes and have HTML do the heavy lifting for us -->
<!-- ! Concerns around accessibility -->
<ul class="category" id="category--user" aria-live="assertive">
    {#each userEnteredCategories as userEnteredCategory, i}
    <li class="user-category">
        <button
			class="user-category__remove"
			type="button"
            on:click={deleteUserCategory}
			data-value="{userEnteredCategory}"
			aria-label="Remove the previously input category '{userEnteredCategory}' from list of categories to be submitted"
        >×</button>
        <label class="user-category__name" for="{userEnteredCategory}_{i}"
            >{userEnteredCategory}</label
        >
        <input
            type="checkbox"
            name="category"
            id="{userEnteredCategory}_{i}"
            value="{userEnteredCategory}"
            class="user-category__value hidden"
            checked
        />
    </li>
	{/each}
</ul>
