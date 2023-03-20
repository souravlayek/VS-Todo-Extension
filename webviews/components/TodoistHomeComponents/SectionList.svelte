<script lang="ts">
    import { onMount } from 'svelte';
    import axios from 'axios';
    import SectionItem from './SectionItem.svelte';
    export let projectID: string = "";
    let isErrorOccured = false
    let errorMessage = "Something went wrong. Please try again later."
    let sections: any = []
    const getAllSections = async () => {
        const authCode = tsvscode.getState().authCode
        const resp = await axios.get(`https://api.todoist.com/rest/v2/sections?project_id=${projectID}`, {
            headers: {
                'Authorization': `Bearer ${authCode}`,
                'Content-Type': 'application/json'
            }
        })
        sections = resp.data
    }
    onMount(async () => {
        try {
            await getAllSections()
        } catch (error) {
            isErrorOccured = true
            errorMessage = (error as Error).message
        }
    })
</script>

<div class="sectionList">
    {#if isErrorOccured}
        <p>{errorMessage}</p>
    {:else}
        {#each sections as section}
            <SectionItem section={section} />
        {/each}
    {/if}

</div>

<style>
</style>