<script>
  import L from "leaflet";
  import AddMarker from "./AddMarker.svelte";

  export let isLogged;

  let map;
  let userMarker;

  var myLocationIcon = L.icon({
    iconUrl: `./assets/myPosition.png`,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });

  let userPosition = {
    lat: 0,
    lng: 0,
  };

  function updateUserLocation(lat, lng) {
    if (userMarker) {
      userPosition.lat = lat;
      userPosition.lng = lng;
      userMarker.setLatLng([lat, lng]);
    } else {
      userMarker = L.marker([lat, lng], { icon: myLocationIcon }).addTo(map);
    }
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      updateUserLocation(lat, lng);
      map.setView([lat, lng], 13);
    },
    (error) => {
      map.setView([48.8416379, 2.4098527], 13);
      console.error("Error getting user location:", error);
    },
    { enableHighAccuracy: true }
  );

  var customIconUrl = "./assets/elecSpot2.png";

  const markerLocations = [
    { lat: 47.2243364, lng: -1.557701, icon: customIconUrl },
  ];

  const initialView = [39.8283, -98.5795];

  function createMap(container) {
    let m = L.map(container, { preferCanvas: true }).setView(initialView, 5);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
                &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
        subdomains: "abcd",
      }
    ).addTo(m);

    function addMarker(location) {
      const marker = L.marker([location.lat, location.lng], {
        icon: L.icon({
          iconUrl: location.icon,
          iconSize: [50, 50],
          iconAnchor: [25, 50],
        }),
        draggable: true,
      }).addTo(m);

      marker.on("dragend", (event) => {
        alert("Marker dragged to: " + event.target.getLatLng());
      });
    }

    markerLocations.forEach((location) => {
      addMarker(location);
    });

    return m;
  }

  function mapAction(container) {
    map = createMap(container);
    return {
      destroy: () => {
        map.remove();
        map = null;
      },
    };
  }

  function resizeMap() {
    if (map) {
      map.invalidateSize();
    }
  }
</script>

<svelte:window on:resize={resizeMap} />

{#if isLogged}
<AddMarker />
  <section id="map-section-logged">
    <div class="map" style="height:100%;width:100%" use:mapAction />
  </section>
{:else}
  <section id="map-section">
    <div class="map" style="height:100%;width:100%" use:mapAction />
  </section>
{/if}

<style>
  #map-section-logged {
    height: 100vh;
    width: 100vw;
  }
  #map-section {
    height: 60vh;
    width: 100vw;
  }
  .map {
    width: 100vw;
    height: 100vh;
  }
</style>
