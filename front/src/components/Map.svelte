<script>
  import { onMount } from "svelte";
  import L from "leaflet";
  import axios from "axios";
  export let isLogged;

  let map;
  let markersLayerEuropeene;
  let markersLayerAmericaine;
  let markersLayerCampingCar;
  let markersLayer;
  let marker;
  let allPoints = [];
  let circles = [];
  let groupMarkersEuropeene = [];
  let groupMarkersAmericaine = [];
  let groupMarkersCampingCar = [];
  let selectedMarker;
  let namePointInput = "";
  let descriptionPointInput = "";
  let latPointToAdd;
  let lngPointToAdd;
  let showModalAskAddPoint = false;
  let showModalAddPoint = false;
  let showModalModifyInfo = false;
  let showConfirmDelete = false;
  let oldType = "";
  let speedInKmPerHour = 0;
  let userLocationMarker;
  let circleMinSpaceBetweenPoint;
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

  const createMarker = (coords, icon, draggable, id) => {
    marker = L.marker(coords, {
      icon: icon,
      draggable: draggable,
    });
  };

  const getAllPoints = async () => {
    allPoints = [];
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
    circles.forEach((circle) => circle.removeFrom(map));
    circles = [];
    markersLayerEuropeene.clearLayers();
    markersLayerAmericaine.clearLayers();
    markersLayerCampingCar.clearLayers();
    groupMarkersEuropeene = [];
    groupMarkersAmericaine = [];
    groupMarkersCampingCar = [];
    allPoints.forEach((point, index) => {
      if (point.priseType === "Européene") {
        groupMarkersEuropeene.push(point);
      }
      if (point.priseType === "Américaine") {
        groupMarkersAmericaine.push(point);
      }
      if (point.priseType === "Prise camping-car") {
        groupMarkersCampingCar.push(point);
      }
    });
    function createMarkerAndBindEvents(markerGroup, markersLayer) {
      markerGroup.forEach((point) => {
        selectedMarker = point._id;
        let pointCoords = [point.coords.lat, point.coords.lng];
        let pointId = point._id;
        let customIconToUse = point.needValidate ? customIconBlue : customIcon;
        circleMinSpaceBetweenPoint = L.circle(pointCoords, {
          color: "grey",
          fillColor: "grey",
          fillOpacity: 0.5,
          radius: minRadiusToAddPoint,
        }).addTo(map);
        circleMinSpaceBetweenPoint.on("contextmenu", () => {
          showModalAskAddPoint = false;
          alert("Un point existe déjà ici.");
        });
        circles.push(circleMinSpaceBetweenPoint);
        createMarker(pointCoords, customIconToUse, point.needValidate, pointId);
        markersLayer.addLayer(marker);
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
        marker.on("click", () => {
          selectedMarker = point;
        });
        marker.on("move", (event) => {
          selectedMarker = point;
          circles.forEach((circle) => circle.removeFrom(map));
          circles = [];
          const newCoords = event.target.getLatLng();
          circleMinSpaceBetweenPoint.setLatLng(newCoords);
        });
        marker.on("contextmenu", () => {
          selectedMarker = point;
          showModalAskAddPoint = false;
          alert("Un point existe déjà ici.");
        });
        marker.on("dragend", (event) => {
          selectedMarker = point;
          const newCoords = event.target.getLatLng();
          updatePointCoordinates(pointId, newCoords.lat, newCoords.lng);
        });
        marker.on("popupopen", (event) => {
          const eyeIcon = document.querySelector(".fa-eye");
          const penIcon = document.querySelector(".fa-pen");
          const trashIcon = document.querySelector(".fa-trash-can");
          eyeIcon.addEventListener("click", async () => {});
          penIcon.addEventListener("click", async () => {
            const userMail = localStorage.getItem("email");
            const userPseudo = localStorage.getItem("username");
            if (userMail !== point.email && userPseudo !== point.addedBy) {
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
            map.closePopup();
            showConfirmDelete = true;
          });
        });
      });
    }
    createMarkerAndBindEvents(groupMarkersEuropeene, markersLayerEuropeene);
    createMarkerAndBindEvents(groupMarkersAmericaine, markersLayerAmericaine);
    createMarkerAndBindEvents(groupMarkersCampingCar, markersLayerCampingCar);
  };

  const closePopup = () => {
    showModalAddPoint = false;
    showModalAskAddPoint = false;
    showModalModifyInfo = false;
    showConfirmDelete = false;
  };

  const addPoint = () => {
    namePointInput = "";
    descriptionPointInput = "";
    showModalAskAddPoint = false;
    showModalAddPoint = true;
  };

  const onMapRightClick = (e) => {
    closePopup();
    map.closePopup();
    showModalAskAddPoint = false;
    showModalAddPoint = false;
    showModalModifyInfo = false;
    showConfirmDelete = false;
    latPointToAdd = e.latlng.lat;
    lngPointToAdd = e.latlng.lng;
    showModalAskAddPoint = true;
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
      namePointInput = "";
      descriptionPointInput = "";
      await refreshPoints();
      showModalAddPoint = false;
    } catch (err) {
      console.log(err);
    }
  };

  const confirmModify = async () => {
    await axios
      .post(`${apiUrl}/api/data/modify-point`, {
        pointId: selectedMarker._id,
        pointName: namePointInput,
        pointDescription: descriptionPointInput,
        priseType: oldType,
      })
      .then(async (res) => {
        await refreshPoints();
        showModalModifyInfo = false;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const confirmDelete = async () => {
    await axios.post(`${apiUrl}/api/data/delete-point`, {
      pointId: selectedMarker._id,
    });
    await refreshPoints();
    showConfirmDelete = false;
  };

  onMount(async () => {
    map = L.map("map");
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    markersLayerEuropeene = L.layerGroup().addTo(map);
    markersLayerAmericaine = L.layerGroup().addTo(map);
    markersLayerCampingCar = L.layerGroup().addTo(map);
    await getAllPoints();
    await refreshPoints();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        let userCoords = [position.coords.latitude, position.coords.longitude];
        map.setView(userCoords, 17);
        userLocationMarker = L.marker(userCoords, {
          icon: myLocationIcon,
        }).addTo(map);
        const goToUserLocation = document.querySelector(
          ".fa-location-crosshairs"
        );
        goToUserLocation.addEventListener("click", () => {
          map.setView(userCoords, 17);
        });
      });
    } else {
      console.error("Geolocation is not available in this browser.");
      map.setView([42, 6], 17);
    }
    map.on("contextmenu", (e) => onMapRightClick(e));
  });
</script>

{#if showConfirmDelete}
  <div id="container-remove-point">
    <div>
      <p>Voulez vous vraiment supprimer ce point ?</p>
    </div>
    <div id="action-delete">
      <button type="submit" id="confirm-delete" on:click={confirmDelete}
        >Oui</button
      >
      <button type="submit" id="cancel-delete" on:click={closePopup}>Non</button
      >
    </div>
    <div />
  </div>
{/if}

{#if showModalModifyInfo}
  <div id="container-add-info-point">
    <i class="fa-solid fa-xmark" on:click={closePopup} />

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
        on:click={confirmModify}>Modifier</button
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

{#if showModalAddPoint}
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

{#if showModalAskAddPoint}
  <div id="container-add-info-point">
    <i class="fa-solid fa-xmark" on:click={closePopup} />

    <p>Voulez vous placer un point ici ?</p>
    <p>(vous pourrez le deplacer avant validation)</p>
    <div id="form'action">
      <button
        type="submit"
        id="add-point-btn"
        style="color:black"
        on:click={addPoint}>Oui</button
      >
      <button
        type="submit"
        id="cancel-add-point-btn"
        style="background-color: var(--red-error); width: 100%; "
        on:click={closePopup}>Non</button
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
    font-size: 1rem;
    right: 5%;
    top: 5%;
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
