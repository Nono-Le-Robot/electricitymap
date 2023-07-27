<script>
  import { onMount } from "svelte";
  import L from "leaflet";
  import axios from "axios";
  export let isLogged;

  let map;
  let markersLayer;
  let allPoints = [];
  let selectedMarker;
  let namePointInput = "";
  let descriptionPointInput = "";
  let latPointToAdd;
  let lngPointToAdd;
  let showModalAddPoint = false;
  let showModalAddInfo = false;
  let showModalModifyInfo = false;
  let showConfirmDelete = false;
  let oldType = "";
  let previousPosition;
  let previousTimestamp;
  let speedInKmPerHour = 0;

  let typesPrises = ["Européenne", "Américaine", "Prise camping-car"];

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

  const getAllPoints = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/data/get-all-points`);
      allPoints = res.data;
    } catch (err) {
      console.log(err);
    }
  };
  const updatePointCoordinates = async (pointId, lat, lng) => {
    try {
      await axios.post(`${apiUrl}/api/data/update-point-coordinates`, {
        pointId: pointId,
        lat: lat,
        lng: lng,
      });
      await refreshPoints();
    } catch (err) {
      console.log(err);
    }
  };
  const refreshPoints = async () => {
    await getAllPoints();
    markersLayer.clearLayers();
    allPoints.forEach((point, index) => {
      const icon = point.needValidate ? customIconBlue : customIcon;
      const marker = L.marker([point.coords.lat, point.coords.lng], {
        id: index,
        icon,
        draggable: point.needValidate,
      }).addTo(markersLayer);
      marker.on("dragend", (event) => {
        const newCoords = event.target.getLatLng();
        const pointId = allPoints[event.target.options.id]._id;
        updatePointCoordinates(pointId, newCoords.lat, newCoords.lng);
      });
      marker.on("click", (event) => {
        selectedMarker = event.target.options.id;
      });

      marker.bindPopup(`
        <b>${point.pointName}</b>
        <p>${point.pointDescription}</p>
        <p>Type : ${point.priseType}</p>
        <p>Ajouté par : ${point.addedBy}</p>
        <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        gap:1rem;
        margin-top:1rem;
        margin-bottom:1.5rem;
        ">
        <i class="fa-solid fa-eye" style="cursor:pointer; font-size:20px"></i>
        <i class="fa-solid fa-pen" style="cursor:pointer; font-size:20px"></i>
        <i class="fa-solid fa-trash-can" style="cursor:pointer; color:red; font-size:20px;"></i>
        </div>
      `);

      marker.on("popupopen", (event) => {
        console.log(selectedMarker);

        const eyeIcon = document.querySelector(".fa-eye");
        const penIcon = document.querySelector(".fa-pen");
        const trashIcon = document.querySelector(".fa-trash-can");
        eyeIcon.addEventListener("click", async () => {});
        penIcon.addEventListener("click", async () => {
          const userMail = localStorage.getItem("email");
          if (userMail !== point.email) {
            alert(
              "Vous n'etes pas le createur de ce point, vous ne pouvez pas le modifier"
            );
            map.closePopup();
            return;
          }
          namePointInput = point.pointName;
          descriptionPointInput = point.pointDescription;
          oldType = point.priseType;
          map.closePopup();
          showModalModifyInfo = true;
          const modifyPointBtn = document.querySelector("#add-point-btn");
          modifyPointBtn.addEventListener("click", async () => {
            await axios
              .post(`${apiUrl}/api/data/modify-point`, {
                pointId: point._id,
                pointName: namePointInput,
                pointDescription: descriptionPointInput,
                priseType: oldType,
              })
              .then(async (res) => {
                markersLayer.eachLayer(function (marker) {
                  if (marker.options.id === selectedMarker) {
                    refreshPoints();
                  }
                });
                showModalModifyInfo = false;
              })
              .catch((err) => {
                console.log(err);
              });
          });
        });
        trashIcon.addEventListener("click", async () => {
          const userMail = localStorage.getItem("email");
          if (userMail !== point.email) {
            alert(
              "Vous n'etes pas le createur de ce point, vous ne pouvez pas le supprimer"
            );
            map.closePopup();
            return;
          }
          showConfirmDelete = true;
        });
      });
    });
  };

  const closePopup = () => {
    showModalAddInfo = false;
    showModalAddPoint = false;
    showModalModifyInfo = false;
  };

  const addPoint = () => {
    showModalAddPoint = false;
    showModalAddInfo = true;
  };

  const cancelAddPoint = () => {
    showModalAddPoint = false;
  };

  const submitInfoPoint = async () => {
    const typePrise = document.querySelector("#type-prise");
    try {
      const res = await axios.post(`${apiUrl}/api/data/add-point`, {
        email: localStorage.getItem("email"),
        pointName: namePointInput,
        pointDescription: descriptionPointInput,
        coords: { lat: latPointToAdd, lng: lngPointToAdd },
        addedBy: localStorage.getItem("username"),
        priseType: typePrise.value,
        addedDate: new Date(),
        needValiate: true,
      });
      await refreshPoints();
      showModalAddInfo = false;
      namePointInput = "";
      descriptionPointInput = "";
    } catch (err) {
      console.log(err);
    }
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function calculateSpeedInKmPerHour(distanceInKm, timeInSeconds) {
    return (distanceInKm / timeInSeconds) * 3600;
  }

  function onLocationFound(e) {
    const userPosition = e.latlng;
    const goToPosition = document.querySelector(".fa-location-crosshairs");
    goToPosition.addEventListener("click", () => {
      map.setView(userPosition, 17);
    });
    const radius = e.accuracy;
    L.marker(e.latlng, { icon: myLocationIcon })
      .addTo(map)
      .bindPopup("Votre position actuelle");

    L.circle(e.latlng, radius).addTo(map);
    const currentTimestamp = new Date().getTime();
    if (previousPosition && previousTimestamp) {
      const distanceInKm = getDistanceFromLatLonInKm(
        previousPosition.lat,
        previousPosition.lng,
        userPosition.lat,
        userPosition.lng
      );
      const timeInSeconds = (currentTimestamp - previousTimestamp) / 1000;
      speedInKmPerHour = calculateSpeedInKmPerHour(distanceInKm, timeInSeconds);
      console.log("Vitesse : ", speedInKmPerHour.toFixed(0), " km/h");
    } else {
      console.log("Vitesse : ", speedInKmPerHour.toFixed(0), " km/h");
    }
    previousPosition = userPosition;
    previousTimestamp = currentTimestamp;
  }

  function onLocationError(e) {
    console.error("Error getting location:", e.message);
  }

  function onMapClick(e) {
    latPointToAdd = e.latlng.lat;
    lngPointToAdd = e.latlng.lng;
    showModalAddPoint = true;
  }

  const cancelDelete = () => {
    showConfirmDelete = false;
  };

  const confirmDelete = async () => {
    try {
      const pointToDelete = allPoints[selectedMarker];
      await axios.post(`${apiUrl}/api/data/delete-point`, {
        pointId: pointToDelete._id,
      });
      markersLayer.eachLayer(function (marker) {
        if (marker.options.id === selectedMarker) {
          marker.removeFrom(map);
        }
      });
      showConfirmDelete = false;
    } catch (err) {
      console.log(err);
    }
  };
  const modifyPoint = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/data/modify-point`, {
        pointId: allPoints[selectedMarker]._id,
        pointName: namePointInput,
        pointDescription: descriptionPointInput,
        priseType: oldType,
      });
      markersLayer.eachLayer(function (marker) {
        if (marker.options.id === selectedMarker) {
          refreshPoints();
        }
      });
      map.closePopup();
      showModalModifyInfo = false;
    } catch (err) {
      console.log(err);
    }
  };

  onMount(async () => {
    map = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.locate({ setView: true });
    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);
    map.on("contextmenu", onMapClick);
    markersLayer = L.layerGroup().addTo(map);
    await refreshPoints();
  });
</script>

<div id="driving-interface">
  <p style=" font-size:30px;  transform: translateY(-10px);">
    {speedInKmPerHour} Km/h
  </p>
</div>

{#if showConfirmDelete}
  <div id="container-remove-point">
    <div>
      <p>Voulez vous vraiment supprimer ce point ?</p>
    </div>
    <div id="action-delete">
      <button type="submit" id="confirm-delete" on:click={confirmDelete}
        >Oui</button
      >
      <button type="submit" id="cancel-delete" on:click={cancelDelete}
        >Non</button
      >
    </div>
    <div />
  </div>
{/if}
{#if showModalModifyInfo}
  <div id="container-add-info-point">
    <div id="champ-text-add-point">
      <input
        autocomplete="off"
        placeholder={namePointInput}
        type="text"
        name="namePoint"
        id="namePointInput"
        required
        bind:value={namePointInput}
      />
      <input
        autocomplete="off"
        placeholder={descriptionPointInput}
        type="text"
        name="descriptionPoint"
        id="descriptionPointInput"
        required
        bind:value={descriptionPointInput}
      />
      <select required id="type-prise" style="width: 100%">
        <option
          value="rethertherhterht"
          style="color:grey"
          disabled
          selected
          hidden>{oldType}</option
        >
        <option style="color : black" value="Européene">Européene</option>
        <option style="color : black" value="Américaine">Américaine</option>
        <option style="color : black" value="Prise camping-car"
          >Prise camping-car</option
        >
      </select>
    </div>
    <div id="form'action">
      <button
        type="submit"
        id="add-point-btn"
        style="color:black"
        on:click={modifyPoint}>Modifier</button
      >
      <button
        type="submit"
        id="cancel-add-point-btn"
        style="background-color: var(--red-error); width: 100%;"
        on:click={closePopup}>Annuler</button
      >
    </div>
  </div>
{/if}

{#if showModalAddInfo}
  <div id="container-add-info-point">
    <i class="fa-solid fa-xmark" on:click={closePopup} />
    <div id="champ-text-add-point">
      <input
        autocomplete="off"
        placeholder="Nom"
        type="text"
        name="namePoint"
        id="namePointInput"
        required
        bind:value={namePointInput}
      />
      <input
        autocomplete="off"
        placeholder="Description"
        type="text"
        name="descriptionPoint"
        id="descriptionPointInput"
        bind:value={descriptionPointInput}
      />
      <select required id="type-prise" style="width: 100%">
        <option value="" style="color:grey" disabled selected hidden
          >Type de prise</option
        >
        <option style="color : black" value="Européene">Européene</option>
        <option style="color : black" value="Américaine">Américaine</option>
        <option style="color : black" value="Prise camping-car"
          >Prise camping-car</option
        >
      </select>
    </div>
    <div id="form'action">
      <button
        type="submit"
        id="add-point-btn"
        style="color:black"
        on:click={submitInfoPoint}>Ajouter</button
      >
    </div>
  </div>
{/if}

{#if showModalAddPoint}
  <div id="container-add-info-point">
    <p>Voulez vous placer un point ici ?</p>
    <p>(vous pourrez le deplacer avant validation)</p>
    <div id="form'action">
      <button
        type="submit"
        id="add-point-btn"
        style="color:black"
        on:click={addPoint}>Ajouter</button
      >
      <button
        type="submit"
        id="cancel-add-point-btn"
        style="background-color: var(--red-error); width: 100%; "
        on:click={cancelAddPoint}>Annuler</button
      >
    </div>
  </div>
{/if}

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
  #driving-interface {
    position: absolute;
    bottom: 0;
    left: 50vw;
    transform: translateX(-50%);
    border-top-right-radius: 1rem;
    border-top-left-radius: 1rem;

    z-index: 999;
    background-color: var(--dark-blue-color);
    color: white;
    width: 170px;
    padding: 0;
    margin: 0;
    height: 70px;
  }
  #action-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
  }
  .fa-xmark {
    position: absolute;
    font-size: 2rem;
    left: 90%;
    top: 2%;
    color: var(--red-error);
    cursor: pointer;
  }
  p {
    text-align: center;
    font-size: 1rem;
  }
  select:required:invalid {
    color: gray;
  }
  button {
    font-size: 1rem;
    width: 150px;
    border: none;
    border-radius: 1rem;
    background-color: white;
    color: black;
    padding: 1rem;
    margin-top: 1rem;
    cursor: pointer;
    font-weight: bold;
  }
  input,
  select {
    font-weight: bold;
    font-size: 17px;
    width: 225px;
    border: none;
    border-radius: 1rem;
    background-color: white;
    padding: 1rem;
    margin-top: 1rem;
  }
  #container-remove-point {
    position: fixed;
    z-index: 1000;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--dark-blue-color);
    padding: 2rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: white;
    width: 260px;
  }

  #confirm-delete {
    background-color: var(--main-color);
  }
  #cancel-delete {
    background-color: var(--red-error);
  }
  #container-add-info-point {
    position: fixed;
    z-index: 1000;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--dark-blue-color);
    padding: 2rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: white;
    width: 260px;
  }
  #champ-text-add-point {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  #add-point-btn {
    background-color: var(--main-color);
    border: none;
    border-radius: 1rem;
    padding: 1rem;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }
  .fa-location-crosshairs {
    color: #ffffff;
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 999;
    font-size: 30px;
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
