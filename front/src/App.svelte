<script>
  import Map from "./Map.svelte";
  import Auth from "./Auth.svelte";
  const logged = true;
</script>

<section id="main">
  {#if logged}
    <Map isLogged={logged} />
    <label>
      <input type="checkbox" />
      <span class="menu"> <span class="hamburger" /> </span>
      <ul>
        <li><a href="#">Accueil</a></li>
        <li><a href="#">Mon Compte</a></li>
        <li><a href="#">Support</a></li>
        <li><a href="#">A propos</a></li>
      </ul>
    </label>
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
    overflow: hidden;
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
    color: #e0e4cc;
    font-size: 1.2em;
    line-height: 1.6;
    background: var(--main-color);
    overflow-x: hidden;
  }

  label .menu {
    position: absolute;
    right: -100px;
    top: -100px;
    z-index: 980;
    width: 200px;
    height: 200px;
    background: #ffffff;
    border-radius: 50% 50% 50% 50%;
    -webkit-transition: 0.5s ease-in-out;
    transition: 0.5s ease-in-out;
    box-shadow: 0 0 0 0 #fff, 0 0 0 0 #fff;
    cursor: pointer;
  }

  label .hamburger {
    position: absolute;
    top: 135px;
    left: 50px;
    width: 30px;
    height: 2px;
    background: var(--main-color);
    display: block;
    -webkit-transform-origin: center;
    transform-origin: center;
    -webkit-transition: 0.5s ease-in-out;
    transition: 0.5s ease-in-out;
  }

  label .hamburger:after,
  label .hamburger:before {
    -webkit-transition: 0.5s ease-in-out;
    transition: 0.5s ease-in-out;
    content: "";
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    background: var(--main-color);
  }

  label .hamburger:before {
    top: -10px;
  }

  label .hamburger:after {
    bottom: -10px;
  }

  label input {
    display: none;
  }

  label input:checked + .menu {
    box-shadow: 0 0 0 100vw #fff, 0 0 0 100vh #fff;
    border-radius: 0;
  }

  label input:checked + .menu .hamburger {
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  label input:checked + .menu .hamburger:after {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
    bottom: 0;
  }

  label input:checked + .menu .hamburger:before {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
    top: 0;
  }

  label input:checked + .menu + ul {
    opacity: 1;
  }

  label ul {
    z-index: 990;
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    opacity: 0;
    -webkit-transition: 0.25s 0s ease-in-out;
    transition: 0.25s 0s ease-in-out;
  }

  label a {
    margin-bottom: 1em;
    display: block;
    color: var(--main-color);
    text-decoration: none;
    font-size: 1.5rem;
  }
</style>
