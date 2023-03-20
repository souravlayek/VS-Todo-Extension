<script lang="ts">
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { v4 as uuidv4 } from 'uuid';
    import SectionList from '../TodoistHomeComponents/SectionList.svelte';
    let myProject: any
    let isErrorOccured: boolean = false
    let errorMessage = "Something went wrong. Please try again later."
    const getOrCreateVSTodoProject = async () => {
        const authCode = tsvscode.getState().authCode
        const todoistProjects = await axios.get('https://api.todoist.com/rest/v2/projects', {
            headers: {
                'Authorization': `Bearer ${authCode}`,
                'Content-Type': 'application/json'
            }
        })
        const vsTodoistProject = todoistProjects.data.find((project: any) => project.name === 'VSTodo')
        console.log(vsTodoistProject)
        if (vsTodoistProject) {
            return vsTodoistProject
        } else {
            const newProject = await axios.post('https://api.todoist.com/rest/v2/projects', {
                name: 'VSTodo',
                color: 30
            }, {
                headers: {
                    'Authorization': `Bearer ${authCode}`,
                    'Content-Type': 'application/json',
                    "X-Request-Id": uuidv4() + "vstodo"
                }
            })
            return newProject.data
        }

    }
    onMount(async () => {
        try {
            myProject = await getOrCreateVSTodoProject()
        } catch (error) {
            isErrorOccured = true
            errorMessage = (error as Error).message
        }
    })
</script>

<main class="todoistHome">
    <h1>Todoist Home</h1>
    {#if isErrorOccured}
        <p>{errorMessage}</p>
    {:else if myProject}
        <SectionList projectID={myProject?.id} />
    {:else}
        <p>Loading...</p>
    {/if}
</main>

<style>
</style>
