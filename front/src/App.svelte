<script>
  import Map from "./Map.svelte";
  import Auth from "./Auth.svelte";
  const logged = true;
</script>

<section id="main">
  {#if logged}
    <Map isLogged={logged} />
  {:else}
    <Map />
    <Auth />
  {/if}
</section>

<style>
  * {
    user-select: none;
  }
  #main {
    display: flex;
    flex-direction: column;
  }

  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  html {
    font-size: 18px;
  }
  body {
    color: #b0d300;
    font-size: 1.2em;
    line-height: 1.6;
    background: var(--main-color);
    overflow-x: hidden;
  }
</style>
