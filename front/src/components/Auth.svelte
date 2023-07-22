<script>
  import axios from "axios";
  import { toasts, ToastContainer, FlatToast } from "svelte-toasts";
  export let isLogged;
  let register = false;
  let userData = {
    email: "",
    username: "",
    password: "",
    repeatPassword: "",
    date: null,
  };

  const showToast = (title, msg, type) => {
    const toastSucess = toasts.add({
      title: title,
      description: msg,
      duration: 2000,
      placement: "bottom-center",
      type: type,
      theme: "dark",
      placement: "bottom-center",
      showProgress: true,
      onClick: () => {},
      onRemove: () => {
        if (type === "success") {
          if (register) {
            register = false;
          } else {
            isLogged = true;
          }
        }
      },
    });
  };

  async function submitData(e) {
    e.preventDefault();
    if (register) {
      if (userData.password !== userData.repeatPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
      } else {
        const res = await axios
          .post("http://localhost:5000/api/auth/register", {
            email: userData.email,
            username: userData.username,
            password: userData.password,
          })
          .then((res) => {
            userData = {
              email: "",
              username: "",
              password: "",
              repeatPassword: "",
              date: null,
            };
            showToast("Inscription réussie !", "Redirection...", "success");
          })
          .catch((err) => {
            console.log("inscr", err);
            showToast("Oups...", err.response.data.message, "error");
          });
      }
    }

    if (!register) {
      const res = await axios
        .post("http://localhost:5000/api/auth/login", {
          email: userData.email,
          password: userData.password,
        })
        .then((res) => {
          userData = {
            email: "",
            username: "",
            password: "",
            repeatPassword: "",
            date: null,
          };
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("userId", res.data.userId);
          localStorage.setItem("username", res.data.username);
          localStorage.setItem("email", res.data.email);
          showToast("Connexion réussie", "Redirection...", "success");
        })
        .catch((err) => {
          console.log(err);

          showToast("Oups...", err.response.data.message, "error");
        });
    }
  }
</script>

{#if register}
  <section id="auth-section">
    <form id="register-form" class="auth-form">
      <label for="email">Email</label>
      <input
        type="email"
        name="email"
        id="email"
        bind:value={userData.email}
        required
      />
      <label for="pseudo">Pseudo</label>
      <input
        type="text"
        name="pseudo"
        id="pseudo"
        bind:value={userData.username}
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
      <label for="repeat-password">Répeter mot de passe</label>
      <input
        type="password"
        name="repeat-password"
        id="repeat-password"
        bind:value={userData.repeatPassword}
        required
      />
      <button type="submit" on:click={submitData}>Inscription</button>
      <p>
        <a
          href="#"
          id="switch-to-login"
          on:click={() => {
            register = false;
          }}>Tu as déjà un compte ?</a
        >
      </p>
    </form>
  </section>
{:else}
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
        <a
          href="#"
          id="switch-to-register"
          on:click={() => {
            register = true;
            console.log(register);
          }}>Tu n'as pas encore de compte ?</a
        >
      </p>
    </form>
  </section>
{/if}

<ToastContainer let:data>
  <FlatToast {data} />
</ToastContainer>

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
  #register-form {
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
