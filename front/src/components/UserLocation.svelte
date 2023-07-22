<!-- UserLocation.svelte -->
<script>
  import { onMount } from "svelte";

  let userPosition = {
    lat: 0,
    lng: 0,
  };

  onMount(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        userPosition = { lat, lng };
      },
      (error) => {
        console.error("Error getting user location:", error);
      },
      { enableHighAccuracy: true }
    );
  });
</script>
