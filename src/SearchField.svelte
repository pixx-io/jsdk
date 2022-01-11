<script>
  import { searchTerm } from "./store/media";
  export let value = '';
  

  let timeout = null;
  const input = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      searchTerm.update(() => value);
    }, 200)
  }
</script>

<div class="searchField fields">
  <div class="field">
    <input bind:value={value} on:input={input} id="pixxio-search" type="text" placeholder=" " />
    <label for="pixxio-search">Search</label>
  </div>
</div>

<style type="text/scss" >
	@import './styles/variables';
  @import './styles/fields';

  .searchField {
    flex: 1;
  }
  
</style>