<script>
  import { createEventDispatcher, onMount } from "svelte";
  import DownloadFormats from "./DownloadFormats.svelte";
  import Selection from "./Selection.svelte";
  import FileItem from "./FileItem.svelte";
  import Loading from './Loading.svelte';
  import { searchTerm, format, v1 } from './store';
  import {API} from './api'
  import { lang } from './translation'

  const dispatch = createEventDispatcher();
  const api = new API();

  export let max = 0;

  let hasError = false;
  let getFiles = null;
  let page = 1;
  let pageSize = 50;
  let files = [];
  let quantity = 0;
  let isLoading = false;
  let query = '';
  let selectedFiles = [];
  $: selectedCount = selectedFiles.length;
  $: maxReached = selectedCount >= max && max;
  $: valid = selectedCount >= 1 && downloadFormat;
  $: downloadFormat = $format;
  $: version1 = $v1;

  onMount(() => {
    getFiles = version1 ? fetchFilesV1() : fetchFiles();
    searchTerm.subscribe(value => {
      query = value;
      if(version1) {
        fetchFilesV1();
      } else {
        fetchFiles();
      }
    })
  });

  const lazyLoad = (event) => {
      if (isLoading || files.length >= quantity) { return; }
      const delta = event.target.scrollHeight - event.target.scrollTop- event.target.offsetHeight;

      if (delta < event.target.offsetHeight/2) {
        page += 1;
        if(version1) {
          fetchFilesV1(true);
        } else {
          fetchFiles(true);
        }
      }
  }

  const fetchFilesV1 = async (attach) => {
    try {
      isLoading = true;
      const filter = query ? {
        searchTerm: query
      } : {};
      const options = { 
        pagination: pageSize + '-' + page,
        ...filter
      }
      const data = await api.get(`/files`, { options: options });
      if(data.success !== 'true') {
        throw new Error(data.errormessage)
      }

      data.files = data.files.map(file => {
        file.selected = selectedFiles.find(f => f.id === file.id);
        return file;
      });
      
      if (attach) {
        files = [...files, ...data.files];
      } else {
        files = data.files;
        quantity = data.quantity;
      }
      isLoading = false;
    } catch(e) {
      hasError = true;
      isLoading = false;
    }
  }

  const fetchFiles = async (attach) => {
    try {
      isLoading = true;
      const filter = query ? {
        filter: {
          filterType: 'searchTerm',
          term: query
        }
      } : {};
      const options = { 
        page, 
        pageSize, 
        responseFields: [
          "id",
          "modifiedPreviewFileURLs",
          "previewFileURL",
          "originalFileURL",
          "width",
          "height",
          "fileName",
          "fileExtension",
          "uploadDate",
          "modifyDate",
          "rating",
          "userID",
          "fileSize",
          "dominantColor"
        ],
        previewFileOptions: [
          {
            height: 400,
            quality: 60
          }
        ],
        ...filter
      }
      const data = await api.get(`/files`, options);
      if(!data.success) {
        throw new Error(data.errormessage)
      }

      data.files = data.files.map(file => {
        file.selected = selectedFiles.find(f => f.id === file.id);
        return file;
      });
      
      if (attach) {
        files = [...files, ...data.files];
      } else {
        files = data.files;
        quantity = data.quantity;
      }
      isLoading = false;
    } catch(e) {
      hasError = true;
      isLoading = false;
    }
  }

  const select = (event) => {
    if (max && max <= selectedFiles.length) {
      return;
    }
    const file = files.find((f) => f.id === event.detail.id);
    file.selected = true;
    files = files;

    selectedFiles = [...selectedFiles, event.detail];
  }

  const deselect = (event) => {
    const file = files.find((f) => f.id === event.detail.id);
    file.selected = false;
    files = files;
    selectedFiles = selectedFiles.filter((f) => f.id !== event.detail.id);
  }

  const submit = async () => {
    dispatch('submit', selectedFiles.map((file) => {
      let url = '';
      let thumbnail = '';
      if (version1) {
        url = downloadFormat === 'preview' ? file.imagePath : file.originalPath,
        thumbnail = file.imagePath;
      } else {
        url = downloadFormat === 'preview' ? file.previewFileURL : file.originalFileURL
        thumbnail = file.modifiedPreviewFileURLs[0];
      }
      return {
        url,
        thumbnail
      }
    }));
  }
</script>

<div class="pixxioFiles">
  {#await getFiles}
    <Loading></Loading>
    {:then} 
    
    <section id="pixxioFiles__container" on:scroll={lazyLoad} class:pixxioFiles__container--maxReached={maxReached} > 
      <ul>
        {#each files as file}
        <FileItem bind:file={file} bind:selected={file.selected} on:select={select} on:deselect={deselect}></FileItem>
        {/each}
      </ul>
    </section>
    
    <div class="pixxioFormats">
      <DownloadFormats></DownloadFormats>
    </div>

    <div class="buttonGroup buttonGroup--right">
      <p><strong>{selectedCount}</strong> {max ? '/' + max : ''} {lang('selected')}</p>
      <Selection on:deselect={deselect} bind:selectedFiles={selectedFiles}></Selection>
      <span style="flex-grow: 1"></span>
      <button class="button button--secondary" on:click={() => dispatch('cancel')}>{lang('cancel')}</button>
      <button class="button" type="submit" disabled={!valid} on:click={submit} >{lang('select')}</button>
    </div>
    {:catch}
    error
  {/await}
</div>

<style lang="scss">
  @import './styles/variables';
  @import './styles/button';
  .pixxioFiles {
    > p {
      padding: 0 30px;
    }
    section {
      overflow-y: auto;
      height: 70vh;
      padding: 0 30px;
    }
    .buttonGroup {
      padding: 0 30px;
    }

    &__container {
      transition: opacity 200ms ease;
      &--maxReached {
        opacity: 0.7;
      }
    }
  }

  .pixxioFormats {
    display: flex;
    justify-content: flex-end;
    padding: 0 30px;
    margin: 20px 0 0;
  }

  .buttonGroup {
    margin-top: 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    
  }
</style>