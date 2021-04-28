<script>
  import { createEventDispatcher } from "svelte";

  export let file = null;
  export let selected = false;

  const dispatch = createEventDispatcher();

  const select = () => {
    dispatch(!selected ? 'select' : 'deselect', file);
  }
</script>

{#if file}
<li on:click={() => select()}>
  <figure>
    <div class="pixxioSquare" class:pixxioSquare--active={file.selected}>
      <img loading="lazy" src={file.imagePath || file.modifiedPreviewFileURLs[0]} alt={file.fileName}>
    </div>
    <figcaption>
      {file.fileName}
    </figcaption>
  </figure>
</li>
{/if}

<style lang="scss">
  @import './styles/variables';
li {
  flex: 1;
  cursor: pointer;
  figure {
    margin: 0;
    padding: 0;
    .pixxioSquare {
      min-width: 120px;
      height: 120px;
      margin: 2px;
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
    }
    figcaption {
      position: absolute;
      opacity: 0;
    }
  }
}
</style>