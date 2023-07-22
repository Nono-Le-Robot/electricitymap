<script>
  function addNewMarker() {
    alert("add new marker");
  }
</script>

<i class="fa-solid fa-plus" on:click={addNewMarker} />

<style>
  .fa-plus {
    position: fixed;
    bottom: 25px;
    left: 50vw;
    z-index: 999;
    transform: translateX(-50%);
    color: white;
    /* z-index: 999;
    top: 100vh;
    left: 50vw;
    color: white; */
    font-size: 2rem;
    padding: 15px;
    border-radius: 100%;
    background-color: var(--main-color);
  }
</style>
