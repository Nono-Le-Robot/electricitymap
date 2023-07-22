<script>
  function addNewMarker() {
    alert("add new marker");
  }
</script>

<i class="fa-solid fa-plus" on:click={addNewMarker} />

<style>
  .fa-plus {
    z-index: 999;
    position: absolute;
    top: 100vh;
    left: 50vw;
    transform: translate(-50%, -150%);
    font-size: 2rem;
    padding: 15px;
    border-radius: 100%;
    background-color: var(--main-color);
    color: white;
  }
</style>
