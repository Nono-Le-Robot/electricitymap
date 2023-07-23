<script>
  import axios from "axios";
  async function addNewMarker() {
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");
    const pointName = "point xxx";
    const pointDescription = "point description";
    const coords = {
      lat: 0,
      lng: 0,
    };
    if (email && userId) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          coords.lat = position.coords.latitude;
          coords.lng = position.coords.longitude;
          const res = axios
            .post("http://localhost:5000/api/data/add-point", {
              email: email,
              pointName: pointName,
              pointDescription: pointDescription,
              coords: {
                lat: coords.lat,
                lng: coords.lng,
              },
              addedBy: userId,
              addedDate: new Date(),
            })
            .then((res) => {
              alert("Point ajouté");
            })
            .catch((err) => {
              console.log(err);
            });
        });
      } else {
        alert("Impossible de récupérer la position actuelle");
      }
    } else {
      alert("Probleme de login. Reconnectez vous");
    }
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
