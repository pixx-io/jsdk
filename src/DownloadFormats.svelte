<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { API } from "./api";
  import { format } from "./store/media";
  import { lang } from "./translation";
  import { allowFormats } from './store/media';

  const dispatch = createEventDispatcher();
  const api = new API();
  let selected;

  let formats = [];
  let hasError = false;
  let isLoading = false;

  let showOriginal = $allowFormats === null || ($allowFormats !== null && $allowFormats.includes('original'));
  let showPreview = $allowFormats === null || ($allowFormats !== null && $allowFormats.includes('preview'));

  $: hideDropdown = ($allowFormats || []).length === 1;

  $: $allowFormats,changes();
  

  onMount(() => {
    if($allowFormats && $allowFormats.length === 1) {
      selected = $allowFormats[0];
      format.update(() => $allowFormats[0]);
      hideDropdown = true;
    } else {
      fetchDownloadFormats();
      select();
    }
  });

  const changes = () => {
    if($allowFormats && $allowFormats.length === 1) {
      selected = $allowFormats[0];
      format.update(() => $allowFormats[0]);
      hideDropdown = true;
    } else {
      fetchDownloadFormats();
      select();
    }
  };

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

      formats = data.downloadFormats.filter((format => allowFormats === null || ($allowFormats !== null && allowFormats.includes(format.id))));
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
    min-width: 10px;
  }
  .downloadFormats {
    margin-right: 10px;
    min-width: 120px;
  }
</style>