
<script>
  import { lang } from './translation';
</script>
<div id="pixxio-ta-loading">
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" id="pixxioIcon" viewBox="0 0 76.52 76.52"><path stroke="black" stroke-width="5" d="M24.76 50.76v-13c0-7.17 5.94-13 13.25-13s13.25 5.83 13.25 13c0 7.18-5.94 13-13.25 13H26.27l-11.17.38s-3.34-8.2-3.34-12.88a26.51 26.51 0 0126.5-26.5 26.51 26.51 0 0126.5 26.5 26.51 26.51 0 01-26.5 26.5c-4.85 0-9.58-1.3-13.5-3.6z" fill="none"/></svg>
  </div>
</div>

<style type="text/scss">
  @import './styles/variables';

#pixxio-ta-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba( 255,255,255,0.8);
  z-index: 10;
  backdrop-filter: blur(5px);
  min-height: 150px;
  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
  }
  p {
    text-align: center;
  }
  svg {
    width: 50px;
    height: 50px;
    margin: 0 auto;
  }
}

#pixxioIcon {
  width: 50px;
  height: 50px;

  stroke-dasharray: 262;
  stroke-dashoffset: 262;
  stroke-linecap: round;
  transition: transformZ(1px);
  animation: dash 2.5s ease-out infinite forwards;
  path {
    fill: none;
    stroke: $primary;
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: -262;
  }
}

</style>