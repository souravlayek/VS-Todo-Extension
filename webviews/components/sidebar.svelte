<script lang="ts">
  import { onMount } from "svelte/internal";
  import { v4 as uuidv4 } from "uuid";
  import TodoItem from "./TodoItem.svelte";
  import Topbar from "./Topbar.svelte";

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

  let todos: Array<TodoItemType> = tsvscode.getState()?.todos || [];
  let renderableTodos: Array<TodoItemType> = todos;
  let categories: Array<string> = loadCategories(todos) || [];

  $: {
    tsvscode.setState({ todos });
  }
  $: {
    renderableTodos = todos;
  }

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.type) {
        case "new-todo":
          updateTodos(message.value);
          break;
        case "load-todo":
          if (message) {
            todos = [...JSON.parse(message.value), ...todos];
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
    const noRepetedCategoryList: Array<string> = [];

    categoryList.forEach((item) => {
      if (noRepetedCategoryList.indexOf(item) === -1) {
        noRepetedCategoryList.push(item);
      }
    });
    return noRepetedCategoryList;
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
      if (categories.indexOf(item) === -1) {
        updatedCategoryList.push(item);
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
    const data = todos.filter((item) => item.id !== id);
    todos = data;
    categories = loadCategories(data);
  };

  const updateTodos = (text: string) => {
    const todoItem = createTodo(text);
    if (!!todoItem) {
      todos = [todoItem, ...todos];
    }
  };
  const filterBasedOnCategories = (text: string | null) => {
    if (text === null) {
      renderableTodos = [...todos];
    } else {
      const filteredTodos: Array<TodoItemType> = todos.filter(
        (item) => item.category.indexOf(text) !== -1
      );
      // console.log(filteredTodos)
      renderableTodos = [...filteredTodos];
    }
  };
</script>

<div class="main">
  <Topbar
    {updateTodos}
    categoryList={categories}
    {filterBasedOnCategories}
  />

  <div class="todolist">
    {#each renderableTodos as todoListKey}
      <TodoItem todo={todoListKey} deleteItem={(id) => deleteItem(id)} />
    {/each}
  </div>
</div>

<style>
</style>
