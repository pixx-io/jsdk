<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { API } from "./api";
  import { format } from "./store";
  import { lang } from "./translation";

  const dispatch = createEventDispatcher();
  const api = new API();
  let selected;

  let formats = [];
  let hasError = false;
  let isLoading = false;

  let showOriginal = true;
  let showPreview = true;

  onMount(() => {
    // fetchDownloadFormats();
    select();
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

      formats = data.downloadFormats;
      isLoading = false;
    } catch(e) {
      hasError = true;
      isLoading = false;
    }
  }

</script>

<div class="downloadFormats fields">
  <div class="field">
    <select bind:value={selected} on:change={select} name="" id="pixxioDownloadFormats__dropdown" placeholder=" ">
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

<style lang="scss">
  @import './styles/variables';
  @import './styles/fields';

  select {
    min-width: 200px;
  }
</style>