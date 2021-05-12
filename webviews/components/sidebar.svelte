<script lang="ts">
    import {  onMount } from "svelte/internal";
    import { v4 as uuidv4 } from 'uuid';
    import TodoList from "./TodoList.svelte"
    import TodoInput from "./TodoInput.svelte"


        const groupBy = (key: any) =>(array: Array<any>) =>
            array.reduce((objectsByKeyValue, obj) => {
                const value = obj[key];
                objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                return objectsByKeyValue;
            }, {});
        let groupByCat = groupBy("category") 
        let todos: Array<{id: string ,task:string, completed:boolean, category: string}> = tsvscode.getState()?.todos || [];
        let grpupedTodos:any = groupByCat(todos)
        let todoListArray:Array<string>;
        console.log(grpupedTodos)
        
        $: {
            tsvscode.setState({ todos })
        }
        $: {
            grpupedTodos = groupByCat(todos)
            console.log(grpupedTodos)
            todoListArray = Object.keys(grpupedTodos)
        }
    
        onMount(() => {
            window.addEventListener("message", (event) => {
                const message = event.data;
                switch (message.type) {
                    case "new-todo":
                        let todoData =  message.value.split("#")
                        console.log(todoData)
                        let todoText = message.value
                        todos =  [{id: uuidv4(),task: message.value, completed:false, category: "" },...todos]
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

        const updateTodos = (text: string) => {
            const todoData =  text.split("#")
            const todoText = todoData[0]
            todoData.shift()
            const tempCategory = todoData.join(" ")
            let category= "general"
            if(tempCategory.trim().length !== 0) {
                category = tempCategory
            }
            if(todoText.trim().length === 0){
                tsvscode.postMessage({type: "onError", value: "No task added"})
                return;
            }
            todos = [{id: uuidv4(),task: todoText, completed: false, category: category}, ...todos];
            // const grouped = groupBy(todos, (c:any) => c.category)
            // console.log(grouped)

        }
    </script>
    
    
    
    <style>

    </style>
    
    <div class="main">
        <TodoInput updateTodos={(data)=> updateTodos(data)} />

        <div class="todolist">
            {#each todoListArray as todoListKey}
                <TodoList heading={todoListKey} todoList={grpupedTodos[todoListKey]} deleteItem={(id) => deleteItem(id)} />
            {/each}
        </div>
        
    </div>
    