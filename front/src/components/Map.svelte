<script>
  import { onMount } from "svelte";
  import L from "leaflet";
  import "leaflet-routing-machine";
  import "leaflet-control-geocoder";
  import "lrm-graphhopper";
  import axios from "axios";
  export let isLogged;

  let map;
  let markersLayerEuropeene;
  let markersLayerAmericaine;
  let markersLayerCampingCar;
  let markersLayer;
  let marker;
  const userMail = localStorage.getItem("email");
  const userPseudo = localStorage.getItem("username");
  let allPoints = [];
  let circles = [];
  let userCoords = [];
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
  let showModalFilter = false;
  let showEU = true;
  let showUS = true;
  let showCC = true;
  let route = null;
  var mapboxAccessToken = "VOTRE_CLÉ_API_MAPBOX";
  let oldType = "";
  let speedInKmPerHour = 0;
  const toleranceDistance = 100; // Seuil de tolérance en mètres
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

  const EUFlagIcon = createCustomIcon(
    "./assets/eu-flag.png",
    [25, 25], // Taille de l'icône
    [0, 60], // Point d'ancrage de l'icône
    [0, 0], // Taille de l'ombre (peut être [0, 0] si vous n'en avez pas besoin)
    [0, 0], // Point d'ancrage de l'ombre (peut être [0, 0] si vous n'en avez pas besoin)
    [15, 0] // Point d'ancrage du popup par rapport au marqueur
  );

  const USFlagIcon = createCustomIcon(
    "./assets/us-flag.png",
    [25, 25], // Taille de l'icône
    [0, 60], // Point d'ancrage de l'icône
    [0, 0],
    [0, 0],
    [15, 0]
  );

  const CCFlagIcon = createCustomIcon(
    "./assets/cc-flag.png",
    [25, 25], // Taille de l'icône
    [0, 60], // Point d'ancrage de l'icône
    [0, 0],
    [0, 0],
    [15, 0]
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
      if (point.priseType === "Européenne") {
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
        console.log(point.priseType);
        let customIconToUse;
        if (point.needValidate) {
          customIconToUse = customIconBlue;
        } else {
          customIconToUse = customIcon;
        }

        selectedMarker = point._id;
        let pointCoords = [point.coords.lat, point.coords.lng];
        let pointId = point._id;
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
        if (point.email === userMail && point.addedBy === userPseudo) {
          createMarker(
            pointCoords,
            customIconToUse,
            point.needValidate,
            pointId
          );
        } else {
          createMarker(pointCoords, customIconToUse, false, pointId);
        }

        markersLayer.addLayer(marker);
        console.log(point.priseType);
        if (point.priseType === "Européenne") {
          const flagMarker = L.marker(pointCoords, {
            icon: EUFlagIcon,
            draggable: false, // Assurez-vous que le drapeau n'est pas déplaçable
          });
          markersLayer.addLayer(flagMarker);
        }
        if (point.priseType === "Américaine") {
          const flagMarker = L.marker(pointCoords, {
            icon: USFlagIcon,
            draggable: false, // Assurez-vous que le drapeau n'est pas déplaçable
          });
          markersLayer.addLayer(flagMarker);
        }
        if (point.priseType === "Prise camping-car") {
          const flagMarker = L.marker(pointCoords, {
            icon: CCFlagIcon,
            draggable: false, // Assurez-vous que le drapeau n'est pas déplaçable
          });
          markersLayer.addLayer(flagMarker);
        }

        function isPointCreator(email, username) {
          if (email === point.addedBy || username === point.addedBy) {
            return `
        <i class="fa-solid fa-pen" style="cursor:pointer; font-size:20px"></i>
        <i class="fa-solid fa-trash-can" style="cursor:pointer; color:red; font-size:20px;"></i>
            `;
          } else {
            return `
        
            `;
          }
        }
        marker.bindPopup(`
        <img style="width:50px; height:50px; padding-bottom:10px;" class="flag" src="assets/${getImageSource(
          point.priseType
        )}" alt="logo" />
        <br>
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
        <i class="fa-solid fa-route" style="cursor:pointer; font-size:20px"></i>
       ${isPointCreator(userMail, userPseudo)}
    
        </div>
      `);
        // <i class="fa-solid fa-eye" style="cursor:pointer; font-size:20px"></i>
        function getImageSource(priseType) {
          switch (priseType) {
            case "Européenne":
              return "eu-flag.png";
            case "Américaine":
              return "us-flag.png";
            case "Prise camping-car":
              return "cc-flag.png";
            // Add more cases for other types, if needed
            default:
              return ""; // Fallback image if priseType doesn't match any case
          }
        }

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
          // const eyeIcon = document.querySelector(".fa-eye");
          if (point.email === userMail && point.addedBy === userPseudo) {
            const penIcon = document.querySelector(".fa-pen");
            const trashIcon = document.querySelector(".fa-trash-can");
            penIcon.addEventListener("click", async () => {
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
          }
          const routeIcon = document.querySelector(".fa-route");
          console.log(routeIcon);
          // eyeIcon.addEventListener("click", async () => {});

          routeIcon.addEventListener("click", async () => {
            const destinationCoords = [
              selectedMarker.coords.lat,
              selectedMarker.coords.lng,
            ];

            // ici verifier si il y a une route et si c'est le cas la supprimer

            const newWaypoints = [
              L.latLng(userCoords),
              L.latLng(destinationCoords),
            ];

            if (
              route &&
              route.getPlan() &&
              route.getPlan().getWaypoints().length > 0
            ) {
              // Si une route existe déjà, on la supprime avant d'en créer une nouvelle
              map.removeControl(route);
            }

            route = L.Routing.control({
              waypoints: [L.latLng(userCoords), L.latLng(destinationCoords)],
              router: L.Routing.graphHopper(
                "c9c11441-d987-4b2e-af75-ddfc52c7168e",
                {
                  urlParameters: {
                    vehicle: "bike",
                    locale: "fr",
                  },
                }
              ),
              routeWhileDragging: true,
              lineOptions: {
                styles: [{ color: "blue", opacity: 0.8, weight: 6 }],
              },
              geocoder: L.Control.Geocoder.nominatim(),
              createMarker: function (i, waypoint, n) {
                return L.marker(waypoint.latLng, {
                  opacity: 0, // Rendre le marqueur invisible
                  draggable: true, // Activer le glisser-déposer si vous en avez besoin
                });
              },
            });
            route.addTo(map);
            route.on("routesfound", function (e) {
              console.log("route found");
              console.log(e);
              //   const route = e.route;
              //   const summary = route.summary;
              //   const distance = summary.totalDistance;
              //   const duration = summary.totalTime;
              //   const start = summary.startPoint;
              //   const end = summary.endPoint;
              //   const point = route.waypoints[1].latLng;
              //   const marker = L.marker(point).addTo(map);
              //   marker.bindPopup(`<p>Distance : ${distance}</p>
              // <p>Temps : ${duration}</p>
              // <p>Départ : ${start}</p>
              // <p>Arrivée : ${end}</p>`);
              //   marker.openPopup();
            });

            closePopup();
          });
        });
      });
    }
    createMarkerAndBindEvents(groupMarkersEuropeene, markersLayerEuropeene);
    createMarkerAndBindEvents(groupMarkersAmericaine, markersLayerAmericaine);
    createMarkerAndBindEvents(groupMarkersCampingCar, markersLayerCampingCar);
  };

  const closePopup = () => {
    map.closePopup();
    showModalAddPoint = false;
    showModalAskAddPoint = false;
    showModalModifyInfo = false;
    showConfirmDelete = false;
    showModalFilter = false;
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

  const showFilter = () => {
    showModalFilter = !showModalFilter;
  };

  const toggleEU = () => {
    showEU = !showEU;
    if (showEU) {
      markersLayerEuropeene.addTo(map);
    } else {
      markersLayerEuropeene.removeFrom(map);
    }
    localStorage.setItem("showEU", showEU);
  };

  const toggleUS = () => {
    showUS = !showUS;
    if (showUS) {
      markersLayerAmericaine.addTo(map);
    } else {
      markersLayerAmericaine.removeFrom(map);
    }
    localStorage.setItem("showUS", showUS);
  };

  const toggleCC = () => {
    showCC = !showCC;
    if (showCC) {
      markersLayerCampingCar.addTo(map);
    } else {
      markersLayerCampingCar.removeFrom(map);
    }
    localStorage.setItem("showCC", showCC);
  };

  const updateUserCoords = () => {};

  onMount(async () => {
    // if ("geolocation" in navigator) {
    //   setInterval(() => {
    //     updateUserCoords();
    //   }, 1000);
    // }

    // if ("geolocation" in navigator) {
    //   navigator.geolocation.getCurrentPosition((position) => {
    //     userCoords = [position.coords.latitude, position.coords.longitude];
    //   });
    //   if (userLocationMarker) {
    //     userLocationMarker.setLatLng(userCoords);
    //   }
    //   console.log("userCoords", userCoords);
    // }
    // else{

    // }
    let showEuLocalStorage = localStorage.getItem("showEU");
    let showUsLocalStorage = localStorage.getItem("showUS");
    let showCcLocalStorage = localStorage.getItem("showCC");

    map = L.map("map");
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.setView([48.85120324709899, 2.344], 10);

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
      // Add the route to the map
    } else {
      a;
      alert("gferger");
      console.error("Geolocation is not available in this browser.");
    }
    map.on("click", (e) => {
      closePopup();
      map.closePopup();
    });
    map.on("contextmenu", (e) => onMapRightClick(e));
    if (showEuLocalStorage) {
      showEU = showEuLocalStorage === "true" ? true : false;
      showEuLocalStorage === "true"
        ? markersLayerEuropeene.addTo(map)
        : markersLayerEuropeene.removeFrom(map);
    }
    if (showUsLocalStorage) {
      showUS = showUsLocalStorage === "true" ? true : false;
      showUsLocalStorage === "true"
        ? markersLayerAmericaine.addTo(map)
        : markersLayerAmericaine.removeFrom(map);
    }
    if (showCcLocalStorage) {
      showCC = showCcLocalStorage === "true" ? true : false;
      showCcLocalStorage === "true"
        ? markersLayerCampingCar.addTo(map)
        : markersLayerCampingCar.removeFrom(map);
    }
  });
</script>

<div id="filter">
  <i class="fa-solid fa-eye-low-vision" on:click={showFilter} />
</div>

{#if showModalFilter}
  <div id="container-remove-point">
    <div id="EU-filter">
      <p>
        Prises Européenne ({groupMarkersEuropeene.length})
      </p>
      {#if showEU}
        <i class="fa-solid fa-eye" on:click={toggleEU} />
      {:else}
        <i class="fa-solid fa-eye-slash" on:click={toggleEU} />
      {/if}
    </div>
    <div id="US-filter">
      <p>
        Prises Américaine ({groupMarkersAmericaine.length})
      </p>
      {#if showUS}
        <i class="fa-solid fa-eye" on:click={toggleUS} />
      {:else}
        <i class="fa-solid fa-eye-slash" on:click={toggleUS} />
      {/if}
    </div>
    <div id="CC-filter">
      <p>
        Prises camping-car ({groupMarkersCampingCar.length})
      </p>
      {#if showCC}
        <i class="fa-solid fa-eye" on:click={toggleCC} />
      {:else}
        <i class="fa-solid fa-eye-slash" on:click={toggleCC} />
      {/if}
    </div>
    <div />
  </div>
{/if}

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
        <option style="color : black" value="Européenne">Européenne</option>
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
        <option style="color : black" value="Européenne">Européenne</option>
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
  .flag {
    width: 50px;
    height: 50px;
  }
  .leaflet-routing-geocoders {
    display: none !important;
  }
  #EU-filter,
  #US-filter,
  #CC-filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  #EU-filter i,
  #US-filter i,
  #CC-filter i {
    cursor: pointer;
  }

  .fa-eye-low-vision {
    color: #ffffff;
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 999;
    font-size: 30px;
    border-radius: 100%;
    background-color: var(--dark-blue-color);
    padding: 1.1rem 0.9rem;
    cursor: pointer;
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
    top: 100px;
    right: 20px;
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
