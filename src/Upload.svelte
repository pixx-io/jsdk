<script>
  import { onMount } from 'svelte';
  import {API} from './api'
  import Loading from './Loading.svelte';
  import { createEventDispatcher } from "svelte";
  import Error from './Error.svelte';
  import { lang } from './translation';
  import { modal, domain, accessToken } from './store/store';
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

      let uploadJobID = null;
      let finishedWebsocketEvents = [];
      const websocketUrl = 'wss://' + $domain.replace(/^(http|https):\/\//, '') + '/gobackend/ws?accessToken=' + $accessToken;
      const socket = new WebSocket(websocketUrl);

      const onFoundWebsocketEvent = (returnData) => {
        socket.close();
        uploadJobID = null;
        finishedWebsocketEvents = [];

        dispatch('uploaded', returnData);
        return returnData;
      };

      socket.onmessage = (event) => {
        try {
          const lines = event.data.split("\n");
          lines.forEach(line => {
            let eventData = JSON.parse(line);
            if (eventData.type === 'finishedJob') {
              finishedWebsocketEvents.push(eventData);

              if (uploadJobID && eventData.jobID === uploadJobID) {
                const returnData = {
                  success: true,
                  id: eventData.jobData.fileID,
                  isDuplicate: eventData.jobData.isDuplicate || false
                };
                onFoundWebsocketEvent(returnData);
              }
            }
          });
        } catch (e) { }
      };

      const formData = new FormData();
      formData.set('asynchronousConversion', true);
      Object.keys(config).forEach(key => {
        if (key !== 'file') {
          formData.set(key, JSON.stringify(config[key]));
        } else {
          formData.set(key, config[key]);
        }
      })
      const response = await api.post('/files', formData, true, null, false, false);
      loading = false;
      if (response.success && response.isDuplicate) {
        errorMessage = lang('duplicate_file');
        dispatch('error', lang('duplicate_file'));
      } else {
        successMessage = lang('success_upload_file');
      }

      if (response.jobID) {
        uploadJobID = response.jobID;
        const foundWebsocketEvent = finishedWebsocketEvents.find((finishedEvent) => finishedEvent.jobID === uploadJobID);
        if (foundWebsocketEvent) {
          const returnData = {
            success: true,
            id: foundWebsocketEvent.jobData.fileID,
            isDuplicate: foundWebsocketEvent.jobData.isDuplicate || false
          };
          onFoundWebsocketEvent(returnData);
        }
      }

      if (!response.success) {
        dispatch('uploaded', response);
        return response;
      }
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