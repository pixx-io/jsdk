<script>
  import { onMount } from "svelte";
  import { API } from "./api";
  import { format } from "./store/media";
  import { lang } from "./translation";
  import { allowFormats } from './store/media';
  import Select from 'svelte-select';

  const api = new API();
  let selected;

  let formats = [];
  let hasError = false;
  let isLoading = false;

  let showOriginal = false;
  let showPreview = false;
  let hideDropdown = true;

  $: {
    $allowFormats;
    hideDropdown = ($allowFormats || []).length === 1;
    showOriginal = $allowFormats === null || ($allowFormats !== null && $allowFormats.includes('original'));
    showPreview = $allowFormats === null || ($allowFormats !== null && $allowFormats.includes('preview'));
    changes();
  }
  

  onMount(() => {
    changes();
  });

  const changes = async () => {
    const downloadFormatIDs = ($allowFormats && $allowFormats.length) ? $allowFormats.filter(format => format !== 'original' && format !== 'preview') : [];

    if (downloadFormatIDs.length) {
      await fetchDownloadFormats();
    } else {
      formats = [];
    }

    if (showPreview) {
      formats.unshift({
        id: 'preview',
        name: lang('preview')
      });
    }

    if (showOriginal) {
      formats.unshift({
        id: 'original',
        name: lang('original')
      });
    }

    if($allowFormats && $allowFormats.length === 1) {
      selected = formats.find((format) => format.id === $allowFormats[0]);
    } else {
      selected = formats[0];
    }
    
    select();
  };

  const select = () => {
    format.update(() => selected.id);
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

      formats = data.downloadFormats.filter((format => allowFormats === null || ($allowFormats !== null && $allowFormats.includes(format.id))));
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
    <Select
      id = 'pixxioDownloadFormats__dropdown'
      items = {formats}
      bind:value = {selected} 
      on:select={select}
      isClearable = {false}
      isSearchable = {false}
      listPlacement = 'top'
      showIndicator = {true}
      optionIdentifier = 'id'
      labelIdentifier = 'name'
      containerClasses = 'customSelect'
      isWaiting = {isLoading}
      listAutoWidth = {true}
    ></Select>
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

    .field {
      flex-direction: column;
    }
  }


  // override Select-styles to make the listContainer's width fit its content
  // should be handled by Select-attribute "listAutoWidth" but this attribute does not seem to work properly
  :global(.customSelect) {
    max-width: 140px;
    --height: 34px;
    --indicatorTop: 6px;
  }
  :global(.customSelect .listContainer) {
    width: fit-content !important;
  }
</style>