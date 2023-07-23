<!-- Votre Svelte component -->

<script>
  import L from "leaflet";
  import axios from "axios";
  import { onMount } from "svelte";
  import AddMarker from "./AddMarker.svelte";

  export let isLogged;

  onMount(async () => {
    let AllPoints;
    try {
      const response = await axios.get(
        "http://localhost:5000/api/data/get-all-points"
      ); // Replace "your_data_endpoint" with the actual API URL
      AllPoints = response.data; // Assuming the response contains an array of data for markers
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    var customIcon = L.icon({
      iconUrl: "./assets/elecSpot2.png",
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      shadowSize: [50, 64], // size of the shadow
      shadowAnchor: [4, 62], // the same for the shadow
      popupAnchor: [0, -40], // point from which the popup should open relative to the iconAnchor
    });

    var myLocationIcon = L.icon({
      iconUrl: `./assets/myPosition.png`,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      shadowSize: [50, 64], // size of the shadow
      shadowAnchor: [4, 62], // the same for the shadow
      popupAnchor: [0, -45], // point from which the popup should open relative to the iconAnchor
    });

    var map = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.locate({ setView: true }); //maxZoom: 16

    function onLocationFound(e) {
      var radius = e.accuracy;

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

    AllPoints.forEach((point) => {
      let pointLat = point.coords.lat;
      let pointLng = point.coords.lng;
      console.log(pointLat, pointLng);
      var marker = L.marker([pointLat, pointLng], { icon: customIcon }).addTo(
        map
      );
      marker.bindPopup(
        `<b>${point.pointName}</b><br>${point.pointDescription}`
      );

      function onMapClick(e) {
        var popup = L.popup();
        var container = document.createElement("div");

        var yesButton = document.createElement("button");
        yesButton.textContent = "oui";
        yesButton.addEventListener("click", handleYesButtonClick);

        var noButton = document.createElement("button");
        noButton.textContent = "non";
        noButton.addEventListener("click", handleNoButtonClick);

        container.appendChild(
          document.createTextNode("Voulez vous placer un point ici ?")
        );
        container.appendChild(yesButton);
        container.appendChild(noButton);

        popup.setLatLng(e.latlng).setContent(container).openOn(map);

        async function handleYesButtonClick() {
          await axios
            .post("http://localhost:5000/api/data/add-point", {
              email: localStorage.getItem("email"),
              pointName: "point xxx",
              pointDescription: "point description",
              coords: {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
              },
              addedBy: localStorage.getItem("userId"),
              addedDate: new Date(),
            })
            .then((res) => {
              console.log(res);

              const point = res.data.point;
              console.log(point);

              var marker = L.marker([point.coords.lat, point.coords.lng], {
                icon: customIcon,
              }).addTo(map);
              marker.bindPopup(
                `<b>${point.pointName}</b><br>${point.pointDescription}`
              );
              //ajouter un custom icon pour le point ajouté
              //ajouter un popup pour le point ajouté

              map.closePopup();
            })
            .catch((err) => {
              console.log(err);
            });
        }

        function handleNoButtonClick() {
          map.closePopup();
        }
      }

      map.on("contextmenu", onMapClick);
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
  #map-section-logged {
    height: 100vh;
    width: 100vw;
  }
  #map-section {
    height: 100vh;
    width: 100vw;
  }
  #map {
    width: 100vw;
    height: 100vh;
  }
</style>
