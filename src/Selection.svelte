<script>
  import { createEventDispatcher } from "svelte";
  import { showSelection } from './store/media';

  const dispatch = createEventDispatcher();
  export let selectedFiles = [];
  $: selected = selectedFiles.slice(0,3);

</script>

<ul>
  {#if showSelection}
    {#each selected as file}
      <li class="pixxioSelection__file" on:click={dispatch('deselect', file)}>
        <img loading="lazy" src={file.imagePath || file.modifiedPreviewFileURLs[0]} alt={file.fileName}>
      </li>
    {/each}
  {/if}
  {#if selectedFiles.length > 3}
  <li>
    + {selectedFiles.length - selected.length}
  </li>
  {/if}
</ul>

<style lang="scss">
  @import './styles/variables';
ul {
  display: flex;
  list-style: none;
  margin: 0 0 0 20px;
  padding: 0;
  li {
    margin: 0 6px;
    width: 50px;
    height: 50px;
    overflow: hidden;
    border-radius: 50%;
    background: #f2f2f2;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &.pixxioSelection__file:hover {
      background: $red;
      img {
        opacity: 0.5;
      }
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 200ms ease;
    }
  }
}
</style>