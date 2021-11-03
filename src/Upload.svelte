<script>
  import { onMount } from 'svelte';
  import {API} from './api'
  import Loading from './Loading.svelte';
  const api = new API();
  let loading = false;
  export let config = {};
  console.log(config);
  const upload = async () => {
    loading = true;
    const formData = new FormData();
    Object.keys(config).forEach(key => {
      formData.set(key, config[key]);
    })
    const response = api.post('/files', formData, true, null, false, false);
    loading = false;
    return response;
  }
  onMount(async () => {
    await upload();
  });
</script>

{#if loading}
<Loading></Loading>
{/if}

{#if loading}

{/if}