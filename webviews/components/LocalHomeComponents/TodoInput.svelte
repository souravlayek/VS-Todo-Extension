<script lang="ts">
    export let updateTodo:(text:string) => void
    let text:string = ""
</script>

<style>

</style>

<!-- svelte-ignore missing-declaration -->
<form on:submit|preventDefault={() => {
    if(text.trim().length !==0) {
        updateTodo(text)
    }else {
        tsvscode.postMessage({type: "onWarn", value: "Please type something"})
    }
    text=""
}}>
    <input type="text" bind:value={text} placeholder="e.g. Your Task #tag1 #tag2" >
</form>