<!-- Votre Svelte component -->

<script>
  import L from "leaflet";
  import axios from "axios";
  import { onMount } from "svelte";
  import AddMarker from "./AddMarker.svelte";

  export let isLogged;

  onMount(async () => {
    const securityRadius = 3;
    let AllPoints;
    try {
      const response = await axios.get(`${apiUrl}/api/data/get-all-points`);
      AllPoints = response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    const customIcon = createCustomIcon(
      "./assets/elecSpot2.png",
      [50, 50],
      [25, 50],
      [50, 64],
      [4, 62],
      [0, -40]
    );
    const myLocationIcon = createCustomIcon(
      `./assets/myPosition.png`,
      [50, 50],
      [25, 50],
      [50, 64],
      [4, 62],
      [0, -45]
    );

    const map = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.locate({ setView: true });

    const existingMarkers = [];

    function createCustomIcon(
      iconUrl,
      iconSize,
      iconAnchor,
      shadowSize,
      shadowAnchor,
      popupAnchor
    ) {
      return L.icon({
        iconUrl,
        iconSize,
        iconAnchor,
        shadowSize,
        shadowAnchor,
        popupAnchor,
      });
    }

    function onLocationFound(e) {
      const radius = e.accuracy;

      L.marker(e.latlng, { icon: myLocationIcon })
        .addTo(map)
        .bindPopup("Votre position actuelle");

      L.circle(e.latlng, radius).addTo(map);
    }

    map.on("locationfound", onLocationFound);

    function onLocationError(e) {
      alert(e.message);
    }

    map.on("locationerror", onLocationError);

    function onMapClick(e) {
      const popup = L.popup();
      const container = document.createElement("div");

      const yesButton = document.createElement("button");
      yesButton.textContent = "oui";
      yesButton.addEventListener("click", handleYesButtonClick);

      const noButton = document.createElement("button");
      noButton.textContent = "non";
      noButton.addEventListener("click", handleNoButtonClick);

      container.appendChild(
        document.createTextNode("Voulez-vous placer un point ici ?")
      );
      container.appendChild(yesButton);
      container.appendChild(noButton);

      popup.setLatLng(e.latlng).setContent(container).openOn(map);

      async function handleYesButtonClick() {
        const existsWithinRadius = existingMarkers.some((markerPos) => {
          const distance = e.latlng.distanceTo(markerPos.latlng);
          return distance <= markerPos.radius;
        });

        if (existsWithinRadius) {
          alert("Une prise existe déjà à cet endroit");
          map.closePopup();
          return;
        }
        const marker = L.marker([e.latlng.lat, e.latlng.lng], {
          icon: customIcon,
        }).addTo(map);

        marker.bindPopup(
          `          
          <b>rezgergzergzergzerg</b>
          <br />
          <p>gzergzergzergzerg</p>
          <img style="cursor:pointer; transition:1s;"; class="photo" src="https://electricitymap.fr/assets/photo-prise-test.jpg" alt="elecSpot" width="100" height="100" />
          <br />
          <div style ="
          display:flex;
          align-items:center;
          justify-content:center;
          gap:1rem;
          margin-top:1rem;
          margin-bottom:1.5rem;
          ">
          <i class="fa-solid fa-eye" style="cursor:pointer; font-size:20px"></i>
          <i class="fa-solid fa-pen" style="cursor:pointer; font-size:20px" ></i>
          <i class="fa-solid fa-trash-can" style="cursor:pointer; color:red; font-size:20px;"></i>
          </div>
        `
        );
        try {
          const res = await axios.post(`${apiUrl}/api/data/add-point`, {
            email: localStorage.getItem("email"),
            pointName: "point xxx",
            pointDescription: "point description",
            coords: {
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            },
            addedBy: localStorage.getItem("userId"),
            addedDate: new Date(),
          });

          existingMarkers.push({
            latlng: e.latlng,
            radius: securityRadius,
          });

          L.circle(e.latlng, securityRadius).addTo(map);

          map.closePopup();
        } catch (err) {
          console.log("Error adding point:", err);
        }
      }

      function handleNoButtonClick() {
        map.closePopup();
      }
    }

    map.on("contextmenu", onMapClick);

    AllPoints.forEach((point) => {
      const marker = L.marker([point.coords.lat, point.coords.lng], {
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(
        `
          <b>${point.pointName}</b>
          <br />
          <p>${point.pointDescription}</p>
          <img style="cursor:pointer; transition:1s;"; class="photo" src="https://electricitymap.fr/assets/photo-prise-test.jpg" alt="elecSpot" width="100" height="100" />
          <br />
          <div style ="
          display:flex;
          align-items:center;
          justify-content:center;
          gap:1rem;
          margin-top:1rem;
          margin-bottom:1.5rem;
          ">
          
          <i class="fa-solid fa-eye" style="cursor:pointer; font-size:20px"></i>
          <i class="fa-solid fa-pen" style="cursor:pointer; font-size:20px" ></i>
          <i class="fa-solid fa-trash-can" style="cursor:pointer; color:red; font-size:20px;"></i>
          </div>
        `
      );

      existingMarkers.push({
        latlng: L.latLng(point.coords.lat, point.coords.lng),
        radius: securityRadius,
      });

      L.circle([point.coords.lat, point.coords.lng], securityRadius).addTo(map);

      marker.on("popupopen", (event) => {
        const photo = document.querySelector(".photo");
        const eyeIcon = document.querySelector(".fa-eye");
        const penIcon = document.querySelector(".fa-pen");
        const trashIcon = document.querySelector(".fa-trash-can");
        photo.addEventListener("click", (e) => {
          e.preventDefault();
          //ouvrir une modal avec les infos du point
        });
        eyeIcon.addEventListener("click", async () => {
          //ouvrir une modal avec les infos du point
          alert("eye clicked, id: " + point._id + "");
        });
        penIcon.addEventListener("click", async () => {
          // await axios.put(`${apiUrl}/api/data/update-point/${point._id}`, {
          //   pointName: "point xxx",
          //   pointDescription: "point description",
          // });
          alert("pen clicked, id: " + point._id + "");
        });
        trashIcon.addEventListener("click", async () => {
          // await axios.delete(`${apiUrl}/api/data/delete-point/${point._id}`);
          alert("trash clicked, id: " + point._id + "");
        });
      });
    });
  });
</script>

{#if isLogged}
  <AddMarker />
  <section id="map-section-logged">
    <div id="map" />
  </section>
{:else}
  <section id="map-section">
    <div id="map" />
  </section>
{/if}

<style>
  #map-section-logged,
  #map-section {
    height: 100vh;
    width: 100vw;
  }
  #map {
    width: 100vw;
    height: 100vh;
  }
</style>
