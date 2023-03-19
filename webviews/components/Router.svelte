<script lang="ts">
    import Home from "./home.svelte";
    import ChooseUsageType from "./pages/ChooseUsageType.svelte";
    import LocalHome from "./pages/LocalHome.svelte";


    export let path: string = ""
</script>

<main class="router">
    {#if path.includes("local-home")}
        <LocalHome />
    {:else if path.includes("signin")}
        <ChooseUsageType />
    {/if}
</main>