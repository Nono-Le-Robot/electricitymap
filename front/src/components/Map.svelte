<!-- Votre Svelte component -->

<script>
  import L, { circle, icon, layerGroup, marker } from "leaflet";
  import axios, { all } from "axios";
  import { onMount } from "svelte";
  import Actions from "./Actions.svelte";
  import { get } from "svelte/store";
  export let isLogged;
  let allPoints = [];
  let idToDelete;

  const getAllPoints = async () => {
    allPoints = [];
    await axios
      .get(`${apiUrl}/api/data/get-all-points`)
      .then((res) => {
        const returnPoints = res.data;
        returnPoints.forEach((point) => {
          allPoints.push(point);
        });
        return allPoints;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  onMount(async () => {
    await getAllPoints();
    console.log(allPoints);
    const customIcon = createCustomIcon(
      "./assets/elecSpot2.png",
      [50, 50],
      [25, 50],
      [50, 64],
      [4, 62],
      [0, -40]
    );
    const customIconBlue = createCustomIcon(
      "./assets/elecSpot2-blue.png",
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
    var markersLayer = L.layerGroup().addTo(map);
    var markersLayerNeedValidate = L.layerGroup().addTo(map);
    var markersLayerConfirmed = L.layerGroup().addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.locate({ setView: true });
    let existingMarkers = [];

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
      const userPosition = e.latlng;
      const goToPosition = document.querySelector(".fa-location-crosshairs");
      goToPosition.addEventListener("click", () => {
        map.setView(userPosition, 20);
      });
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
        let existsWithinRadius = existingMarkers.some((markerPos) => {
          const distance = e.latlng.distanceTo(markerPos.latlng);
          return distance <= markerPos.radius;
        });
        if (existsWithinRadius) {
          alert("Une prise existe déjà à cet endroit");
          map.closePopup();
          return;
        }
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
            needValiate: true,
          });
          await refreshPoints();
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
    const refreshPoints = async () => {
      await getAllPoints();
      markersLayer.clearLayers();
      allPoints.forEach((point, index) => {
        var marker = L.marker([point.coords.lat, point.coords.lng], {
          id: index,
          icon: customIconBlue,
        }).addTo(markersLayer);
        marker.on("click", (event) => {
          idToDelete = event.target.options.id;
        });
        if (!point.needValidate) {
          var marker = L.marker([point.coords.lat, point.coords.lng], {
            id: index,
            icon: customIcon,
          }).addTo(markersLayer);
        }
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
        const deleteMarker = async (markerId) => {
          try {
            await axios.post(`${apiUrl}/api/data/delete-point`, {
              pointId: markerId,
            });
            markersLayer.eachLayer(function (marker) {
              if (marker.options.id === markerId) {
                marker.removeFrom(map);
              }
            });
            allPoints = allPoints.filter((point) => point._id !== markerId);
          } catch (err) {
            console.log(err);
          }
        };
        marker.on("popupopen", (event) => {
          console.log(idToDelete);
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
            await axios
              .post(`${apiUrl}/api/data/delete-point`, {
                pointId: point._id,
              })
              .then(async (res) => {
                markersLayer.eachLayer(function (marker) {
                  if (marker.options.id === idToDelete) {
                    // markersLayer.removeLayer(marker);
                    marker.removeFrom(map);
                  }
                });
                const markerIdToDelete = point._id;
                await deleteMarker(markerIdToDelete);
                map.closePopup();
              })
              .catch((err) => {
                console.log(err);
              });
          });
        });
      });
    };

    await refreshPoints();
  });
</script>

{#if isLogged}
  <i class="fa-solid fa-location-crosshairs" />
  <section id="map-section-logged">
    <div id="map" />
  </section>
{:else}
  <section id="map-section">
    <div id="map" />
  </section>
{/if}

<style>
  .fa-location-crosshairs {
    color: #fff;
    font-size: 2rem;
    position: absolute;
    bottom: 30px;
    left: 30px;
    z-index: 999;
    font-size: 1rem;
    border-radius: 100%;
    background-color: var(--dark-blue-color);
    padding: 1rem;
    cursor: pointer;
  }
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
