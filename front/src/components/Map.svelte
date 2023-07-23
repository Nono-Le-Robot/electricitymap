<!-- Votre Svelte component -->

<script>
  import L from "leaflet";
  import axios from "axios";
  import { onMount } from "svelte";
  import AddMarker from "./AddMarker.svelte";

  export let isLogged;

  onMount(async () => {
    const securityRadius = 2;
    let AllPoints;
    try {
      const response = await axios.get(
        "http://localhost:5000/api/data/get-all-points"
      );
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

        try {
          const res = await axios.post(
            "http://localhost:5000/api/data/add-point",
            {
              email: localStorage.getItem("email"),
              pointName: "point xxx",
              pointDescription: "point description",
              coords: {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
              },
              addedBy: localStorage.getItem("userId"),
              addedDate: new Date(),
            }
          );

          const point = res.data.point;

          const marker = L.marker([point.coords.lat, point.coords.lng], {
            icon: customIcon,
          }).addTo(map);

          marker.bindPopup(
            `<b>${point.pointName}</b><br>${point.pointDescription}`
          );

          existingMarkers.push({
            latlng: e.latlng,
            radius: securityRadius, // Change this value to the desired radius of the circle
          });

          L.circle(e.latlng, securityRadius).addTo(map); // Add circle around the new marker

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
        `<b>${point.pointName}</b><br>${point.pointDescription}`
      );

      existingMarkers.push({
        latlng: L.latLng(point.coords.lat, point.coords.lng),
        radius: securityRadius, // Change this value to the desired radius of the circle
      });

      L.circle([point.coords.lat, point.coords.lng], securityRadius).addTo(map); // Add circle around existing marker
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
