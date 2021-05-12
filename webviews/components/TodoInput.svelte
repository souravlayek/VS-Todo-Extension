<script lang="ts">
    export let updateTodos:(text:string) => void
    let text:string = ""
</script>

<style>

</style>

<!-- svelte-ignore missing-declaration -->
<form on:submit|preventDefault={() => {
    if(text.trim().length !==0) {
        updateTodos(text)
    }else {
        tsvscode.postMessage({type: "onWarn", value: "Please type something"})
    }
    text=""
}}>
    <input type="text" bind:value={text} placeholder="Enter Task" >
</form>