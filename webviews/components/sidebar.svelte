<script lang="ts">
  import { onMount } from "svelte/internal";
  import { v4 as uuidv4 } from "uuid";
  import EmptyTab from "./Emptytab.svelte";
  import TodoItem from "./TodoItem.svelte";
  import TopBar from "./Topbar.svelte";

  const loadCategories = (todoList: Array<TodoItemType>) => {
    const tempCategoryList: Array<string> = [];
    todoList.forEach((item) => {
      item.category.forEach((cat) => {
        if (tempCategoryList.indexOf(cat) === -1) {
          tempCategoryList.push(cat);
        }
      });
    });
    return tempCategoryList;
  };

  let todoList: Array<TodoItemType> = tsvscode.getState()?.todoList || [];
  let todoListToRender: Array<TodoItemType> = [...todoList];
  let categories: Array<string> = loadCategories(todoList) || [];
  let isAlwaysDelete: boolean = tsvscode.getState()?.isAlwaysDelete || false;

  $: {
    tsvscode.setState({ todoList, isAlwaysDelete });

    tsvscode.postMessage({
      type: "onTodoAdd",
      value: {
        incomplete: todoList.filter((item) => !item.completed).length,
        complete: todoList.filter((item) => item.completed).length,
      },
    });
  }
  $: {
    todoListToRender = todoList;
  }

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.type) {
        case "new-todo":
          addNewTodo(message.value);
          break;
        case "load-todo":
          if (message) {
            todoList = [...JSON.parse(message.value), ...todoList];
          }
          break;
        case "delete-todo":
          if (message) {
            const { id, isAlways } = JSON.parse(message.value);
            deleteItem(id);
            if (isAlways) {
              isAlwaysDelete = isAlways;
            }
          }
          break;
        default:
          break;
      }
    });
  });

  const extractCategories = (text: string) => {
    const wordList: Array<string> = text.split(" ");
    const categoryList = wordList.filter((item) => item.indexOf("#") !== -1);
    const noRepetendCategoryList: Array<string> = [];

    categoryList.forEach((item) => {
      if (noRepetendCategoryList.indexOf(item) === -1) {
        noRepetendCategoryList.push(item.toLowerCase());
      }
    });
    return noRepetendCategoryList;
  };
  const extractTask = (text: string) => {
    const wordList: Array<string> = text.split(" ");
    const taskWordList = wordList.filter((item) => item.indexOf("#") === -1);
    const task = taskWordList.join(" ");
    return task;
  };

  const createTodo = (text: string): TodoItemType | undefined => {
    let categoryList = extractCategories(text);
    let todoText = extractTask(text);
    if (todoText.trim().length === 0) {
      tsvscode.postMessage({ type: "onError", value: "No task added" });
      return;
    }
    const updatedCategoryList: Array<string> = [];

    categoryList.forEach((item) => {
      if (categories.indexOf(item.toLowerCase()) === -1) {
        updatedCategoryList.push(item.toLowerCase());
      }
    });
    categories = [...categories, ...updatedCategoryList];
    return {
      id: uuidv4(),
      task: todoText,
      completed: false,
      category: categoryList,
      timeStamp: Date.now(),
    };
  };

  const deleteItem = (id: string): void => {
    const data = todoList.filter((item) => item.id !== id);
    todoList = data;
    categories = loadCategories(data);
  };

  const requestDeleteItem = (id: string) => {
    if(!isAlwaysDelete) {
      tsvscode.postMessage({
        type: "onDeleteRequest",
        value: id,
      });
    }else {
      deleteItem(id);
    }
  };

  const addNewTodo = (text: string) => {
    const todoItem = createTodo(text);
    if (!!todoItem) {
      todoList = [todoItem, ...todoList];
    }
  };
  const filterBasedOnCategories = (text: string | null) => {
    let filteredTodoList: Array<TodoItemType> = [];
    if (text === null) {
      todoListToRender = [...todoList];
    } else {
      if (text === "complete") {
        filteredTodoList = todoList.filter((item) => item.completed);
      } else if (text === "incomplete") {
        filteredTodoList = todoList.filter((item) => !item.completed);
      } else {
        filteredTodoList = todoList.filter(
          (item) => item.category.indexOf(text.toLowerCase()) !== -1
        );
      }
      todoListToRender = [...filteredTodoList];
    }
  };

  const toggleComplete = (id: string) => {
    const updatedTodoList = todoList.map((item) => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    todoList = updatedTodoList;
  };
</script>

<div class="main">
  <TopBar
    updateTodo={addNewTodo}
    categoryList={categories}
    {filterBasedOnCategories}
  />

  <div class="todoList">
    {#if todoListToRender.length === 0}
      <EmptyTab />
    {:else}
      {#each todoListToRender as todoListKey}
        <TodoItem
          todo={todoListKey}
          deleteItem={(id) => requestDeleteItem(id)}
          {toggleComplete}
        />
      {/each}
    {/if}
  </div>
</div>

<style>
</style>
