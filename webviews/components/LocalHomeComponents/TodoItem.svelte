<script lang="ts">
  import { format } from "date-fns/fp";
  export let todo: TodoItemType;
  export let deleteItem: (id: string) => void;
  export let toggleComplete: (id: string) => void;
</script>

<div class="todoItem">
  <div class="top">
    <div class="main">
      <div class="checkBox">
        <input
          class="checkbox-round"
          type="checkbox"
          checked={todo.completed}
          on:change={() => {
            toggleComplete(todo.id);
          }}
        />
      </div>

      <div
        on:dblclick={() => {
          toggleComplete(todo.id);
        }}
        class="todoText"
      >
        <p class={todo.completed ? "completed" : ""}>
          {todo.task}
        </p>
      </div>
    </div>
    <div class="delete">
      <span on:click={() => deleteItem(todo.id)}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          ><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
          /></svg
        >
      </span>
    </div>
  </div>
  <div class="bottom">
    <span class="date badge">
      {format("dd MMM | h:m aaa", todo.timeStamp)}
    </span>
    {#each todo.category as categoryItem}
      <span class="category badge">
        {categoryItem}
      </span>
    {/each}
  </div>
</div>

<style>
  .todoItem {
    background-color: var(--vscode-input-background);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    padding: 10px 5px;
    border-radius: 5px;
    gap: 10px;
    margin: 10px 0px;
    /* font-size: 1.2rem; */
  }
  /* .todoItem input {
        margin-right: 5px;
    } */
  .todoItem .top {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .main {
    width: 100%;
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    gap: 10px;
  }
  .todoText {
    flex-grow: 1;
    cursor: pointer;
  }
  .todoText p {
    cursor: text;
    width: fit-content;
  }
  .delete {
    /* width: 10px; */
    margin-right: 10px;
    cursor: pointer;
  }
  .bottom {
    width: 100%;
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }
  /*     
    .todoItem .top p {
        margin-left: 5px;
        -moz-user-select: none;
        -webkit-user-select: none;
    } */
  .completed {
    text-decoration: line-through;
    color: grey;
  }
  .badge {
    width: fit-content;
    padding: 3px 4px;
    border-radius: 2px;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
  }
  .date {
    border-radius: 3px;
    background-color: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.5);
    color: "#fff";
    font-size: 10px;
  }
  .category {
    border-radius: 3px;
    background-color: rgba(0, 238, 255, 0.1);
    border: 1px solid rgba(0, 238, 255, 0.5);
    color: "#fff";
    font-size: 10px;
  }
  .checkbox-round {
    width: 1.3em;
    height: 1.3em;
    background-color: white;
    border-radius: 50%;
    vertical-align: middle;
    border: 1px solid #ddd;
    /* -webkit-appearance: none; */
    outline: none;
    cursor: pointer;
  }

  .checkbox-round:checked {
    background-color: gray;
  }
</style>
