<script>
  import Map from "./components/Map.svelte";
  import Auth from "./components/Auth.svelte";
  import axios from "axios";

  const userVersion = "v1.2";
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  let logged;

  const checkVersion = async () => {
    const serverVersion = await axios.post(`${apiUrl}/api/data/app-version`, {
      userVersion: userVersion,
    });
    const needUpdate = serverVersion.data.needUpdate;
    if (needUpdate) {
      if (!serverVersion || serverVersion !== userVersion) {
        if (
          confirm(
            "Une mise à jour est disponible. Voulez-vous la faire maintenant ?"
          )
        ) {
          window.location.href =
            "https://play.google.com/store/apps/details?id=fr.electricitymap.android.abc";
        }
      }
    } else return;
  };

  checkVersion();

  userId && username && email && token ? (logged = true) : (logged = false);

  function hideAuthMenu() {
    logged = true;
  }
</script>

<section id="main">
  {#if logged}
    <Map isLogged={logged} />
  {:else}
    <div id="background" />
    <div id="flex-logo-form-auth">
      <img
        id="logo"
        src="https://electricitymap.fr/assets/logo.png"
        alt=""
        srcset=""
      />
      <Auth on:Connected={hideAuthMenu} isLogged={logged} />
    </div>
  {/if}
</section>

<style>
  #privacy-policy {
    position: absolute;
    bottom: 20px;
    left: 50vw;
    transform: translateX(-50%);
  }
  #flex-logo-form-auth {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    height: 100vh;
  }

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
    filter: grayscale(80%);
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
      width: 700px;
    }
  }
  @media (max-width: 800px) {
    #logo {
      width: 650px;
    }
  }
  @media (max-width: 700px) {
    #logo {
      width: 500px;
    }
  }
  @media (max-width: 550px) {
    #logo {
      width: 400px;
    }
  }

  @media (max-width: 450px) {
    #logo {
      width: 340px;
    }
  }
</style>
