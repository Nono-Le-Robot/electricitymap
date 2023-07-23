<script>
  import { onMount } from "svelte";
  import Map from "./components/Map.svelte";
  import Auth from "./components/Auth.svelte";
  import Popup from "./components/Popup.svelte";

  let logged = true;
  const popupIsVisible = true;

  let data;
  onMount(async () => {
    //récupérer les points avec axios.
  });
  function hideAuthMenu() {
    logged = true;
  }
</script>

<section id="main">
  {#if popupIsVisible}
    <!-- <Popup /> -->
  {/if}

  {#if logged}
    <Map isLogged={logged} />
  {:else}
    <Map />
    <Auth on:Connected={hideAuthMenu} isLogged={logged} />
  {/if}
</section>

<style>
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
