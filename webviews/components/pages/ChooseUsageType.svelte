<script lang="ts">

const handleIntegration = (integration: string) => {
      if (integration === "local") {
        tsvscode.postMessage({
          type: "integrate",
          value: "local",
        });
      } else if (integration === "todoist") {
        tsvscode.postMessage({
          type: "integrate",
          value: "todoist",
        });
      }
    };

</script>

<div class="options">
        <button on:click={() => handleIntegration("todoist")}>Connect Todoist</button>
        <button on:click={() => handleIntegration("local")}>Use Locally</button>
</div>

<style>
        .options {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 1rem;
        }
    </style>