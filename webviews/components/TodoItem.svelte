<script lang="ts">
    export let todo: {id: string ,task:string, completed:boolean, category: string};
    export let deleteItem: (id: string) => void;
</script>

<style>
    .todoItem{
        background-color: var(--vscode-input-background);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
        box-sizing: border-box;
        padding: 10px 5px;
        /* font-size: 1.2rem; */
    }
    /* .todoItem input {
        margin-right: 5px;
    } */
    .todoItem .top {
        display: flex;
        align-items: center;
    }
    .todoItem .top p {
        margin-left: 5px;
        -moz-user-select: none;
        -webkit-user-select: none;
    }
    .completed {
        text-decoration: line-through;
        color: grey;
    }
</style>

<div on:dblclick={() => {todo.completed = !todo.completed}} class="todoItem">
    <div class="top">
    <p class={todo.completed?"completed":""}>{todo.task}</p>
</div>
    
    <span on:click={() => deleteItem(todo.id)}>
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"/></svg></span>
</div>