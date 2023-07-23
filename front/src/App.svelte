<script>
  import { onMount } from "svelte";
  import Map from "./components/Map.svelte";
  import Auth from "./components/Auth.svelte";
  import Popup from "./components/Popup.svelte";
  import Actions from "./components/Actions.svelte";

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  let logged;

  if (userId && username && email && token) {
    logged = true;
  } else {
    logged = false;
  }
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
    <Actions />
  {:else}
    <div id="background" />
    <div id="flex-logo-form-auth">
      <img
        id="logo"
        src="https://electricitymap.fr/assets/logo.png"
        alt=""
        srcset=""
      />
      <!-- <Map /> -->
      <Auth on:Connected={hideAuthMenu} isLogged={logged} />
    </div>
  {/if}
</section>

<style>
  #flex-logo-form-auth {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    height: 100vh;
  }
  /* #logo {
    position: absolute;
    top: 50px;
    left: 50vw;
    transform: translateX(-50%);
    width: 1200px;
    height: auto;
    object-fit: cover;
    z-index: 1;
  } */
  #background {
    background: url("https://electricitymap.fr/assets/background.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    /* filter: brightness(90%); */
    /* filter: saturate(50%); */
    /* filter: grayscale(60%); */
    filter: grayscale(80%);
    /* filter: blur(0.5rem); */
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

  @media (max-width: 2000px) {
    #logo {
      width: 800px;
    }
  }
  @media (max-width: 1400px) {
    #logo {
      /* background-color: red; */
      width: 700px;
    }
  }
  @media (max-width: 800px) {
    #logo {
      /* background-color: red; */
      width: 650px;
    }
  }
  @media (max-width: 700px) {
    #logo {
      /* background-color: red; */
      width: 500px;
    }
  }
  @media (max-width: 550px) {
    #logo {
      /* background-color: red; */
      width: 400px;
    }
  }

  @media (max-width: 450px) {
    #logo {
      /* background-color: red; */
      width: 340px;
    }
  }
</style>
