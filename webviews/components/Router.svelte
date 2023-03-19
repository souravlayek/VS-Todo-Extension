<script lang="ts">
    import ChooseUsageType from "./pages/ChooseUsageType.svelte";
    import LocalHome from "./pages/LocalHome.svelte";
    import TodoistHome from "./pages/TodoistHome.svelte";


    export let path: string = ""
</script>

<main class="router">
    {#if path.includes("local-home")}
        <LocalHome />
    {:else if path.includes("signin")}
        <ChooseUsageType />
    {:else if path.includes("todoist-home")}
        <TodoistHome />
    {/if}
</main>