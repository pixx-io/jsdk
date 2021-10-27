<script>
  import { createEventDispatcher, onMount } from "svelte";
  import DownloadFormats from "./DownloadFormats.svelte";
  import Selection from "./Selection.svelte";
  import FileItem from "./FileItem.svelte";
  import Loading from './Loading.svelte';
  import { searchTerm, format, v1, modal } from './store';
  import {API} from './api'
  import { lang } from './translation'

  const dispatch = createEventDispatcher();
  const api = new API();

  export let max = 0;
  export let allowedTypes = [];
  export let allowedFormats = null;

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
  $: valid = selectedCount >= 1 && $format;
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
      let allowedTypeFilter = [];
      let queryFilter = [];
      let filter = {};

      if (allowedTypes.length) {
        allowedTypeFilter = [{
          filterType: 'connectorOr',
          filters: [
            ...allowedTypes.map(type => ({
              filterType: 'fileExtension',
              fileExtension: type
            }))
          ]
        }]
      }
      
      if (query) {
        queryFilter = [{
          filterType: 'searchTerm',
          term: query
        }]
      }

      if (query || allowedTypes.length) {
        filter = {
          filter: {
            filterType: 'connectorAnd',
            filters: [
              ...queryFilter,
              ...allowedTypeFilter
            ]
          }
        }
      }

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
      console.log(e);
      hasError = true;
      isLoading = false;
    }
  }

  const select = (event) => {
    // if (max && max <= selectedFiles.length) {
    //   return;
    // }
    const file = files.find((f) => f.id === event.detail.id);
    file.selected = true;
    files = files;

    selectedFiles = [event.detail, ...selectedFiles.slice(0, max-1)];
    markSelected();
  }

  const deselect = (event) => {
    selectedFiles = selectedFiles.filter((f) => f.id !== event.detail.id);
    markSelected();
  }

  const markSelected = () => {
    files.forEach((file) => {
      file.selected = false;
    });
    files = files;
    selectedFiles.forEach((sf) => {
      const file = files.find(f => f.id == sf.id)
      file.selected = true;
      files = files;
    });
  }

  const fetchDownloadFormats = async (id) => {
    const convert = await api.get('/files/convert', {
      ids: [id],
      downloadType: 'downloadFormat',
      downloadFormatID: downloadFormat
    })

    const checkDownload = async () => {
      const download = await api.get('/files/download', {
        downloadID: convert.downloadID
      });
      if (!download.downloadURL) {        
        return await new Promise((resolve) => {
          setTimeout(() => checkDownload().then((result) => resolve(result)), 100);
        });
      } else {
        return download.downloadURL;
      }
    }

    return await checkDownload();
  }

  const submit = async () => {
    const preparedFiles = [];
    isLoading = true;
    for (let i = 0; i < selectedFiles.length; i += 1) {
      const file = selectedFiles[i];
      let url = '';
      let thumbnail = '';
      if (version1) {
        url = downloadFormat === 'preview' ? file.imagePath : file.originalPath,
        thumbnail = file.imagePath;
      } else {
        url = downloadFormat === 'preview' ? file.previewFileURL : file.originalFileURL
        thumbnail = file.modifiedPreviewFileURLs[0];
      }

      if (!['preview', 'original'].includes(downloadFormat)) {
        // catch format
        url = await fetchDownloadFormats(file.id);
      }

      preparedFiles.push({
        id: file.id,
        url,
        thumbnail
      })
    }
    isLoading = false;
    dispatch('submit', preparedFiles)
  }
</script>

<div class="pixxioFiles" class:no-modal={!$modal}>
  {#await getFiles}
    <Loading></Loading>
    {:then} 
    
    <section class="pixxioFiles__container" on:scroll={lazyLoad} class:pixxioFiles__container--maxReached={maxReached} > 
      <ul>
        {#each files as file}
        <FileItem bind:file={file} bind:selected={file.selected} on:select={select} on:deselect={deselect}></FileItem>
        {/each}
      </ul>
    </section>
    
    <div class="pixxioFormats">
      <DownloadFormats bind:allowedFormats={allowedFormats}></DownloadFormats>
    </div>

    <div class="buttonGroup buttonGroup--right">
      <p><strong>{selectedCount}</strong> {max ? '/' + max : ''} {lang('selected')}</p>
      <Selection on:deselect={deselect} bind:selectedFiles={selectedFiles}></Selection>
      <span style="flex-grow: 1"></span>
      <button class="button button--secondary" on:click={() => dispatch('cancel')}>{lang('cancel')}</button>
      <button class="button" type="submit" disabled={!valid || isLoading} on:click={submit} >{lang('select')}</button>
    </div>
    {:catch}
    error
  {/await}
</div>

<style lang="scss">
  @import './styles/variables';
  @import './styles/button';
  .pixxioFiles {
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
    &.no-modal {
      section {
        height: auto;
        max-height: 70vh;
        padding: 0;
      }
      .buttonGroup {
        padding: 0;
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