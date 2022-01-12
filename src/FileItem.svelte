<script>
  // TIPPY
  import tippy from 'tippy.js';

  import { createEventDispatcher, onDestroy } from "svelte";
  import { showFileSize, showFileType, showFileName, maxFiles } from './store/media';

  export let file = null;
  export let selected = false;

  let tooltipElement = null;
  let tippyInstance = null;

  $: if (file) {
    createTippy();
  }

  const dispatch = createEventDispatcher();
  let lastClick = 0;
  let clickTimeout;
  const clickProvider = () => {
    if ($maxFiles === 1) {
      const delta = Date.now() - lastClick;
      if (clickTimeout) {
          clearTimeout(clickTimeout);
        }
      if (delta < 200) {
        selectAndClose();
      } else {
        clickTimeout = setTimeout(() => {
          select();
        }, 200);
      }
      lastClick = Date.now();
    } else {
      select();
    }
  }

  const select = () => {
    dispatch(!selected ? 'select' : 'deselect', file);
  }
  const selectAndClose = () => {
    if ($maxFiles === 1) {
      dispatch('selectAndClose', file);
    } else {
      select();
    }
  }

  const readableSize = (size) => {
    if (size > 100000000) {
      return Math.ceil(size/1000000000*100)/100 + ' GB';
    }
    if (size > 100000) {
      return Math.ceil(size/1000000*100)/100 + ' MB';
    }
    if (size > 1000) {
      return Math.ceil(size/1000) + ' KB';
    }

    return Math.ceil(size) + ' B';
  }

  const createTippy = () => {
    if (tooltipElement) {
      destroyTippy();
      tippyInstance = tippy(tooltipElement, {
        content: file.fileName,
        arrow: false
      });
    }
  };

  const destroyTippy = () => {
    if (tippyInstance) {
      tippyInstance.destroy();
    }
  }

  onDestroy(() => destroyTippy());
</script>

{#if file}
<li on:click={() => clickProvider()}>
  <figure>
    <div class="pixxioSquare" class:pixxioSquare--active={file.selected}>
      <img loading="lazy" src={file.imagePath || file.modifiedPreviewFileURLs[0]} alt={file.fileName}>
      <div class="tags">
        {#if $showFileSize}
        <div class="tag">{readableSize(file.fileSize)}</div>
        {/if}
        {#if $showFileType}
        <div class="tag">{file.fileExtension}</div>
        {/if}
      </div>
    </div>
    {#if $showFileName}
    <figcaption bind:this={tooltipElement}>
      {file.fileName}
    </figcaption>
    {/if}
  </figure>
</li>
{/if}

<style lang="scss">
  @import './styles/variables';
li {
  flex: 1;
  cursor: pointer;
  figure {
    margin: 2px;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.15);
    .pixxioSquare {
      min-width: 120px;
      height: 120px;
      background: #f2f2f2;
      border-radius: 4px;
      overflow: hidden;
      border: 2px solid transparent;
      position: relative;
      transition: border 200ms ease;
      &:after {
        content: '';
        display: block;
        background: $primary;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        opacity: 0;
        transition: opacity 200ms ease;
      }

      &--active {
        border: 2px solid $secondary;
        box-shadow: 0 0 4px rgba($secondary, 0.5);
        &:after {
          opacity: 0.5;
        }
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      .tags {
        display: flex;
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 3px;
        .tag {
          background: #333;
          color: white;
          border-radius: 3px;
          display: inline-block;
          padding: 2px 4px;
          box-shadow: 0 0 3px rgba(0,0,0,0.25);
          font-size: 8px;
          margin: 0 0 0 2px;
        }
      }
    }
    figcaption {
      font-size: 10px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      width: 120px;
      padding: 3px;
      display: block;
      margin: 0 0 5px;
    }
  }
}
</style>