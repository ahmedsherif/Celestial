<script>
	import { onMount } from "svelte";

    let categories = [];
    let userEnteredCategories = [];
    let currentCategoryName = '';

	onMount(async () => {
        const response = await fetch("/api/v1/micropub/category/")
            .catch(error => console.error(error));

        const data = await response.json()
            .catch(error => console.error(error));
        
		if (data.error) console.error(data.error_description);
        else categories = data;
    });
    
    const handleKeyUp = (event) => {
        if (!event.key === 'Enter') return;

        // Stop form submission
        event.preventDefault();
        // 
        console.log("You have written", currentCategoryName);
    };
</script>

<input
    type="text"
    id="field-group__category"
    name="user-category"
    aria-describedby="field-group__description--category"
    list="categories"
    on:keyup={handleKeyUp}
    bind:value={currentCategoryName}
/>

<datalist id="categories">
    {#each categories as category}
    <option value="{category}" />
    {/each}
</datalist>

<!-- To avoid handling the form manually just for categories, we build a list of checkboxes and have HTML do the heavy lifting -->
<div class="hidden">
    {#each userEnteredCategories as userEnteredCategory}
        <input type="checkbox" name="category" />
    {/each}
</div>
