<script lang="ts">
  import TodoInput from "./TodoInput.svelte";
  export let updateTodo: (text: string) => void;
  export let filterBasedOnCategories: (text: string | null) => void;
  export let categoryList: Array<string>;
  let filterOpened: Boolean = false;

</script>

<div class="topBarWrapper">
  <div class="topBar">
    <div class="inputBox">
      <TodoInput updateTodo={(data) => updateTodo(data)} />
    </div>
    <div
      on:click={() => {
        filterOpened = !filterOpened;
      }}
      class="filterButton"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        ><path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M15 2v1.67l-5 4.759V14H6V8.429l-5-4.76V2h14zM7 8v5h2V8l5-4.76V3H2v.24L7 8z"
        /></svg
      >
    </div>
  </div>
  {#if filterOpened}
    <div class="topBarBody">
      <div class="catagories">
        <p class="heading">Filters:</p>
        <p class="hint">? Click to filter</p>
        <div class="categoryItemList">
          <div
            on:click={() => filterBasedOnCategories(null)}
            class="categoryItem"
          >
            All
          </div>
          <div
            on:click={() => filterBasedOnCategories("complete")}
            class="categoryItem"
          >
            Completed
          </div>
          <div
            on:click={() => filterBasedOnCategories("incomplete")}
            class="categoryItem"
          >
            Not Completed
          </div>
          {#each categoryList as category}
            <div
              on:click={() => filterBasedOnCategories(category)}
              class="categoryItem"
            >
              {category.slice(1)}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .topBarWrapper {
    margin: 20px 0;
  }
  .topBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
  }
  .inputBox {
    flex-grow: 1;
  }
  .filterButton {
    cursor: pointer;
    padding: 5px;
    background-color: var(--vscode-input-background);
  }
  .categoryItemList {
    margin-top: 5px;
    margin-bottom: 10px;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }
  .categoryItem {
    cursor: pointer;
    padding: 5px;
    width: fit-content;
    background-color: var(--vscode-input-background);
  }
  .heading {
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .hint {
    font-size: 10px;
    letter-spacing: 1px;
    color: rgba(0, 183, 255, 0.253);
  }
</style>
