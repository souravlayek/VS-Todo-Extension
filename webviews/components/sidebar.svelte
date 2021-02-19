<script lang="ts">
    import {  onMount } from "svelte/internal";
    import { v4 as uuidv4 } from 'uuid';
        let todos: Array<{id: string ,task:string, completed:boolean}> = tsvscode.getState()?.todos || [];
        let text:string = ""
        $: {
            tsvscode.setState({ todos })
        }
    
        onMount(() => {
            window.addEventListener("message", (event) => {
                const message = event.data;
                switch (message.type) {
                    case "new-todo":
                        todos =  [{id: uuidv4(),task: message.value, completed:false},...todos]
                        console.log(todos)
                        break;
                    case "load-todo":
                        if (message){
                            todos =  [...JSON.parse(message.value),...todos]
                        }
                        break;
                    default:
                        break;
                }
            })
        })
    
        const deleteItem = (id: string):void => {
            const data = todos.filter(item => item.id !== id)
            todos = data
        }
    </script>
    
    
    
    <style>
        .todoItem{
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-direction: row;
        }
        .todoItem input {
            margin-right: 20px;
        }
        .todoItem {
            padding: 10px 0 10px 0;
            font-size: 1.2rem;
        }
        .todoItem .top {
            display: flex;
            align-items: center;
        }
        .todoItem .top p {
            margin-left: 10px;
        }
        .completed {
        text-decoration: line-through;
        color: grey;
        }
    </style>
    
    <div class="main">
        <form on:submit|preventDefault={()=>{
            todos = [{id: uuidv4(),task: text, completed: false}, ...todos];
            text ="";
        }}>
            <input type="text" bind:value={text} placeholder="Enter Task" >
        </form>
        <div class="todolist">
            {#each todos as todo}
            <div class="todoItem">
                <div class="top">
                <input type="checkbox" bind:checked={todo.completed}>
                <p class={todo.completed?"completed":""}>{todo.task}</p></div>
                <span on:click={() => deleteItem(todo.id)}>
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"/></svg></span>
    </div>
            {/each}
        </div>
        
    </div>
    