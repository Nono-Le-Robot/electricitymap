<script>
  function handleYesPopup() {
    alert("yes");
  }

  function handleNoPopup() {
    alert("no");
  }
</script>

<div id="popup-container">
  <div id="popup-top">
    <p id="popup-message">hrthrth</p>
  </div>
  <div id="popup-bottom">
    <div id="user-choice">
      <button id="popup-yes" on:click={handleYesPopup}>Oui</button>
      <button id="popup-no" on:click={handleNoPopup}>Non</button>
    </div>
  </div>
</div>

<style>
  #popup-container {
    padding: 30px;
    z-index: 99999;
    position: fixed;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
    background-color: var(--popup-color);
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
  }
  #popup-top {
  }
  #popup-bottom {
    display: flex;
    justify-content: center;
  }
  #popup-message {
    text-align: center;
    color: white;
  }
  #user-choice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 50px;
  }
  #popup-yes {
    background-color: var(--green-validate);
  }
  #popup-no {
    background-color: var(--red-error);
  }
  #popup-yes,
  #popup-no {
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    border: none;
  }
</style>
