<script>
  import { createEventDispatcher, onMount } from "svelte";
  import DownloadFormats from "./DownloadFormats.svelte";
  import Selection from "./Selection.svelte";
  import FileItem from "./FileItem.svelte";
  import Loading from './Loading.svelte';
  import { modal, compact, websocket } from './store/store';
  import { searchTerm, format, maxFiles, showSelection, allowTypes, additionalResponseFields, changed } from './store/media';
  import {API} from './api'
  import { lang } from './translation';
  import Error from './Error.svelte';

  const dispatch = createEventDispatcher();
  const api = new API();

  $: max = $maxFiles;

  let getFiles = null;
  let page = 1;
  let pageSize = 50;
  let files = [];
  let quantity = 0;
  let isLoading = false;
  let query = '';
  let selectedFiles = [];
  $: selectedCount = selectedFiles.length;
  $: maxReached = selectedCount >= max && max > 0;
  $: valid = selectedCount >= 1 && $format;
  $: downloadFormat = $format;

  onMount(() => {
    getFiles = fetchFiles();
    searchTerm.subscribe(value => {
      query = value;
      changes();
    })
    changed.subscribe(() => changes())
  });

  const changes = () => {
    page = 1;
    fetchFiles();
  };

  const lazyLoad = (event) => {
      if (isLoading || files.length >= quantity) { return; }
      const delta = event.target.scrollHeight - event.target.scrollTop- event.target.offsetHeight;

      if (delta < event.target.offsetHeight/2) {
        page += 1;
        fetchFiles(true);
      }
  }

  const fetchFiles = async (attach) => {
    try {
      isLoading = true;
      let allowedTypeFilter = [];
      let queryFilter = [];
      let filter = {};
      if ($allowTypes.length) {
        allowedTypeFilter = [{
          filterType: 'connectorOr',
          filters: [
            ...$allowTypes.map(type => ({
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

      if (query || $allowTypes.length) {
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
          "dominantColor",
          ...$additionalResponseFields
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

  const selectAndClose = (event) => {
    select(event);
    submit();
  }

  const select = (event) => {
    // if (max && max <= selectedFiles.length) {
    //   return;
    // }
    const file = files.find((f) => f.id === event.detail.id);
    file.selected = true;
    files = files;
    if (max > 0) {
      selectedFiles = [event.detail, ...selectedFiles.slice(0, max-1)];
    } else {
      selectedFiles = [event.detail, ...selectedFiles];
    }
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
    let finishedWebsocketEvents = [];
    let downloadJobID = null;
    
    return new Promise((resolve, reject) => {
      const onFoundWebsocketEvent = (returnData) => {
        downloadJobID = null;
        finishedWebsocketEvents = [];

        resolve(returnData.jobData.downloadURL);
      };

      $websocket.onmessage = (event) => {
        try {
          const lines = event.data.split("\n");
          lines.forEach(line => {
            let eventData = JSON.parse(line);
            if (eventData.type === 'finishedJob') {
              finishedWebsocketEvents.push(eventData);

              if (downloadJobID && eventData.jobID === downloadJobID) {
                const returnData = {
                  success: true,
                  jobData: eventData.jobData
                };
                onFoundWebsocketEvent(returnData);
              }
            }
          });
        } catch (error) {}
      };
      
      api.get('/files/convert', {
        ids: [id],
        downloadType: 'downloadFormat',
        downloadFormatID: downloadFormat
      }).then((convertResponse) => {
        downloadJobID = convertResponse.jobID;
        const foundWebsocketEvent = finishedWebsocketEvents.find((finishedEvent) => finishedEvent.jobID === downloadJobID);
        if (foundWebsocketEvent) {
          const returnData = {
            success: true,
            jobData: foundWebsocketEvent.jobData
          };
          onFoundWebsocketEvent(returnData);
        }
      });
    });
  }

  const submit = async () => {
    const preparedFiles = [];
    isLoading = true;
    for (let i = 0; i < selectedFiles.length; i += 1) {
      const file = selectedFiles[i];
      let url = downloadFormat === 'preview' ? file.previewFileURL : file.originalFileURL;
      const thumbnail = file.modifiedPreviewFileURLs[0];

      if (!['preview', 'original'].includes(downloadFormat)) {
        // catch format
        url = await fetchDownloadFormats(file.id);
      }

      preparedFiles.push({
        id: file.id,
        url,
        thumbnail,
        file: file
      });
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
        <FileItem bind:file={file} bind:selected={file.selected} on:selectAndClose={selectAndClose} on:select={select} on:deselect={deselect}></FileItem>
        {/each}
      </ul>
    </section>
    <div class:compact={$compact}>
      <div class="buttonGroup buttonGroup--right">
        {#if $maxFiles > 0}
        <p style="white-space: nowrap; padding: 0 10px 0 0; margin: 0"><strong>{selectedCount}</strong> {$maxFiles > 0 ? '/' + $maxFiles : ''} 
          {!$compact ? lang('selected') : ''}</p>
        {/if}
        {#if $showSelection && !$compact}
          <Selection on:deselect={deselect} bind:selectedFiles={selectedFiles}></Selection>
        {/if}
        <span style="flex-grow: 1"></span>
        <DownloadFormats></DownloadFormats>
        <button class="button" type="submit" disabled={!valid || isLoading} on:click={submit} >{lang('select')}</button>
      </div>
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
      padding: 20px 30px;
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
        max-height: 500px;
        padding: 0;
      }
      .buttonGroup {
        padding: 20px 0;
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

  .compact{
    .buttonGroup {
      padding: 10px !important;
      background: white;
      position: absolute;
      bottom: 3px;
      left: 50%;
      transform: translate(-50%, 0);
      border-radius: 4px; 
      max-width: 100%;
      box-shadow: 0 0 3px rgba(0,0,0,0.25);
      //border: 1px solid #ccc;

    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    
  }
</style>