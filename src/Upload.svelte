<script>
  import { onMount } from 'svelte';
  import {API} from './api'
  import Loading from './Loading.svelte';
  import { createEventDispatcher } from "svelte";
  import Error from './Error.svelte';
  import { lang } from './translation';
  import { modal } from './store/store';
  const api = new API();
  let loading = false;
  export let config = {};
  $: config,upload();
  let errorMessage = '';
  let successMessage = '';
  const dispatch = createEventDispatcher();
  const upload = async () => {
    if(loading) {
      return false;
    }
    loading = true;
    try {
      errorMessage = '';
      successMessage = '';
      const formData = new FormData();
      formData.set('asynchronousConversion', false);
      Object.keys(config).forEach(key => {
        if (key !== 'file') {
          formData.set(key, JSON.stringify(config[key]));
        } else {
          formData.set(key, config[key]);
        }
      })
      const response = await api.post('/files', formData, true, null, false, false);
      loading = false;
      dispatch('uploaded', response);
      if (response.success && response.isDuplicate) {
        errorMessage = lang('duplicate_file');
        dispatch('error', lang('duplicate_file'));
      } else {
        successMessage = lang('success_upload_file');
      }
      return response;
    } catch(error) {
      loading = false; 
      errorMessage = error;
      console.error(error);
      dispatch('error', error);
    }
    return false;
  }
  onMount(async () => {
    await upload();
  });
</script>
<div class="upload" class:no-modal={!$modal}>
  {#if loading}
    <Loading></Loading>
  {/if}
  {#if errorMessage}
  <Error>
    {errorMessage}
  </Error>
  {/if}
  {#if successMessage}
  <Error success={true}>
    {successMessage}
  </Error>
  {/if}
</div>
<style lang="scss">
  .upload {
    padding: 0 30px;
    &.no-modal {
      padding: 0;
    }
  }
</style>