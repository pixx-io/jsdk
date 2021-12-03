<div class:success={$$props.success}> 
  <slot></slot>
</div>
<style lang="scss">
  div {
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 0 5px rgba(0,0,0,0.15);
    background: rgb(202, 63, 63);
    color: white;
    font-size: 14px;
    margin: 10px 0;
   
    &.success {
      background: rgb(77, 143, 46);
    }
  }
</style>