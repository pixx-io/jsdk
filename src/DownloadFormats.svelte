<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { API } from "./api";
  import { format } from "./store";
  import { lang } from "./translation";

  export let allowedFormats = null;

  const dispatch = createEventDispatcher();
  const api = new API();
  let selected;

  let formats = [];
  let hasError = false;
  let isLoading = false;

  let showOriginal = allowedFormats === null || (allowedFormats !== null && allowedFormats.includes('original'));
  let showPreview = allowedFormats === null || (allowedFormats !== null && allowedFormats.includes('preview'));

  let hideDropdown = false;

  

  onMount(() => {
    if(allowedFormats && allowedFormats.length === 1) {
      selected = allowedFormats[0];
      format.update(() => allowedFormats[0]);
      hideDropdown = true;
    } else {
      fetchDownloadFormats();
      select();
    }
  });

  const select = () => {
    format.update(() => selected);
  }

  const fetchDownloadFormats = async () => {
    try {
      isLoading = true;
      const options = { 
        responseFields: ["id","name"],
      }
      const data = await api.get(`/downloadFormats`, options);
      if(!data.success) {
        throw new Error(data.errormessage)
      }

      formats = data.downloadFormats.filter((format => allowedFormats === null || (allowedFormats !== null && allowedFormats.includes(format.id))));
      isLoading = false;
    } catch(e) {
      hasError = true;
      isLoading = false;
    }
  }

</script>

{#if !hideDropdown}
<div class="downloadFormats fields">
  <div class="field">
    <select bind:value={selected} on:blur={select} name="" id="pixxioDownloadFormats__dropdown" placeholder=" ">
      {#if showPreview}
      <option value="preview">{lang('preview')}</option>
      {/if}
      {#if showOriginal}
      <option value="original">{lang('original')}</option>
      {/if}
      {#each formats as format}
      <option value={format.id}>{format.name}</option>
      {/each}
    </select>
    <label for="pixxioDownloadFormats__dropdown">{lang('please_select')}</label>
  </div>
</div>
{/if}

<style lang="scss">
  @import './styles/variables';
  @import './styles/fields';

  select {
    min-width: 200px;
  }
</style>