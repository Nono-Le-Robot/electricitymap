<script>
  import axios from "axios";
  import { toasts, ToastContainer, FlatToast } from "svelte-toasts";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

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
      placement: "top-center",
      type: type,
      theme: "dark",
      placement: "top-center",
      showProgress: true,
      onClick: () => {},
      onRemove: () => {
        if (type === "success") {
          if (register) {
            register = false;
          } else {
            dispatch("Connected", { logged: true });
          }
        }
      },
    });
  };

  async function submitData(e) {
    e.preventDefault();
    if (register) {
      if (userData.password !== userData.repeatPassword) {
        showToast("Oups...", "Les mots de passe ne correspondent pas", "error");
        return;
      } else {
        const res = await axios
          .post(`${apiUrl}/api/auth/register`, {
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
        .post(`${apiUrl}/api/auth/login`, {
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
          localStorage.setItem('profile-picture', res.data.picture)
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
      <div class="inputs-form">
        <label for="email" />
        <input
          autocomplete="off"
          placeholder="Email"
          type="email"
          name="email"
          id="email"
          bind:value={userData.email}
          required
        />
        <label for="pseudo" />
        <input
          autocomplete="off"
          placeholder="Pseudo"
          type="text"
          name="pseudo"
          id="pseudo"
          bind:value={userData.username}
          required
        />
        <label for="password" />
        <input
          autocomplete="off"
          placeholder="Mot de passe"
          type="password"
          name="password"
          id="password"
          bind:value={userData.password}
          required
        />
        <label for="repeat-password" />
        <input
          autocomplete="off"
          placeholder="Répéter le mot de passe"
          type="password"
          name="repeat-password"
          id="repeat-password"
          bind:value={userData.repeatPassword}
          required
        />
      </div>
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
      <p>
        <a
          id="privacy-policy"
          href="https://electricitymap.fr/privacy-policy.html"
          >Politique de Confidentialité</a
        >
      </p>
    </form>
  </section>
{:else}
  <section id="auth-section">
    <form id="login-form" class="auth-form">
      <div class="inputs-form">
        <label for="email" />
        <input
          autocomplete="off"
          placeholder="Email"
          type="email"
          name="email"
          id="email"
          bind:value={userData.email}
          required
        />
        <label for="password" />
        <input
          autocomplete="off"
          placeholder="Mot de passe"
          type="password"
          name="password"
          id="password"
          bind:value={userData.password}
          required
        />
      </div>
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
      <p>
        <a
          id="privacy-policy"
          href="https://electricitymap.fr/privacy-policy.html"
          >Politique de Confidentialité</a
        >
      </p>
    </form>
  </section>
{/if}

<ToastContainer let:data>
  <FlatToast {data} />
</ToastContainer>

<style>
  #version-user {
    color: white;
    position: absolute;
    bottom: 5px;
    left: 10px;
    z-index: 888888;
  }
  .inputs-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  #register-form {
    gap: 1rem;
    padding: 3rem;
  }

  #login-form {
    padding: 3rem;
    gap: 1rem;
  }

  #register-form,
  #login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background-color: var(--main-color);
    border-radius: 0.5rem;
  }
  #login-form button,
  #register-form button {
    font-size: 20px;
    width: 150px;
    border: none;
    border-radius: 0.5rem;

    background-color: white;
    color: black;
    padding: 1rem;
    margin-top: 1rem;
    cursor: pointer;
    font-weight: bold;
  }
  #login-form input,
  #register-form input {
    font-weight: bold;
    font-size: 17px;
    width: 225px;
    border: none;
    border-radius: 0.5rem;

    background-color: white;
    padding: 1rem;
    margin-top: 1rem;
  }

  #switch-to-login,
  #switch-to-register,
  #privacy-policy {
    color: rgb(0, 0, 0);
    font-size: 15px;

    margin-top: 1rem;
  }
</style>
