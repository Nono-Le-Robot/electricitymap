<script>
  let userData = {
    email: "",
    password: "",
    date: null,
  };
  function submitData(e) {
    e.preventDefault();
    userData.date = new Date().toISOString();
    console.log(userData);
  }
</script>

<section id="auth-section">
  <form id="login-form" class="auth-form">
    <label for="email">Email</label>
    <input
      type="email"
      name="email"
      id="email"
      bind:value={userData.email}
      required
    />
    <label for="password">Mot de passe</label>
    <input
      type="password"
      name="password"
      id="password"
      bind:value={userData.password}
      required
    />
    <button type="submit" on:click={submitData}>Connexion</button>
    <p>
      <a href="#" id="switch-to-register">Tu n'as pas encore de compte ?</a>
    </p>
  </form>
</section>

<style>
  #login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 40vh;
    background-color: var(--main-color);
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }
</style>
