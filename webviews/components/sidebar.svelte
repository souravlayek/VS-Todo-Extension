<script lang="ts">
    import { onMount } from "svelte";
    import Router from "./Router.svelte";
    let integration = "";
    let activePath = "signin";
    $: {
      if(integration === "local") {
        activePath = "local-home"
      }else if(integration === "todoist") {
        activePath = "todoist-home"
      }
    }

    onMount(() => {
      tsvscode.postMessage({
        type: "integration-request",
        value: "",
      });
      window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.type) {
          case "integration-reply":
            if (message) {
              integration = message.value?.type;
              const authCode = message.value?.authCode
              tsvscode.setState({authCode, integration})
            }
            break;
          default:
            break;
        }
      });
    });
</script>

<main class="main">
  <Router path={activePath}  />
</main>

<style>

</style>