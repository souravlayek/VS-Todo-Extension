<script lang="ts">
    import { onMount } from 'svelte';
    import axios from 'axios';
    export let section : any
</script>

<style>

</style>

<div class="sectionItem">
    <h1>{section.name}</h1>
    <!-- <TaskList sectionID={section.id} /> -->
</div>