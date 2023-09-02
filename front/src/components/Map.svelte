<script>
  import { onMount } from "svelte";
  import L from "leaflet";
  import axios from "axios";
  export let isLogged;

  let map;
  let markersLayerEvents;
  let markersLayerEuropeene;
  let markersLayerAmericaine;
  let markersLayerCampingCar;
  let marker;
  let pressed = false;
  let userMail = localStorage.getItem("email");
  let userPseudo = localStorage.getItem("username");
  let userId = localStorage.getItem("userId");
  let userToken = localStorage.getItem("token");
  let userProfilPicture = localStorage.getItem('profile-picture')
  let allPoints = [];
  let myPoints = [];
  let allEvents = [];
  let circles = [];
  let userCoords = [];
  let groupMarkersEvents = [];
  let groupMarkersEuropeene = [];
  let groupMarkersAmericaine = [];
  let groupMarkersCampingCar = [];
  let selectedMarker;
  let selectedEventName;
  let selectedEventDescription;
  let selectedEventInformations;
  let selectedEventCreatedBy;
  let selectedEventEmail;
  let selectedEventDistance;
  let selectedEventIframe;
  let selectedEventCoords;
  let selectedEventStartDate;
  let selectedEventEndDate;
  let selectedEventStartHour;
  let selectedEventDescriptionAnimation;
  let selectedEventParticipationFee;
  let selectedEventRegistration;
  let commentReport = "";
  let namePointInput = "";
  let nameEventInput = "";
  let idEventToUpdate = "";
  let descriptionPointInput = "";
  let descriptionEventInput = "";
  let hasAnimation = false;
  let hasInscription = false;
  let informationsEventInput;
  let userParticipationFee = "";
  let distanceEventInput = "";
  let giveDescription = "";
  let inscriptionEvent = false;
  let startDateEventInput = "";
  let endDateEventInput = "";
  let startHourEventInput = "";
  let iframeEventInput = "";
  let newUsernameInput = "";
  let animationDescription = "";
  let participationFee = "";
  let lockView = true;
  let latPointToAdd;
  let lngPointToAdd;
  let showIconPanel = true;
  let showModalAskAction = false;
  let showModalAddPoint = false;
  let showModalModifyInfo = false;
  let showModalModifyInfoEvent = false;
  let showConfirmDelete = false;
  let showConfirmDeleteEvent = false;
  let showModalFilter = false;
  let showStartRoute = false;
  let showModalSettings = false;
  let showModalEvents = false;
  let showModalPlacePoint = false;
  let showModalPlaceEvent = false;
  let showModalEventDetails = false;
  let showModalAccountSettings = false;
  let showModalReportPointFirstStep = false;
  let showModalReportPointTwoStep = false;
  let showModalReportPointConfirm = false;
  let showModalReportPointError = false;
  let showModalEnterNewUsername = false;
  let showModalConfirmDeleteAccount = false;
  let showModalAnimation = false;
  let showModalCreateEvent;
  let coordsToAddPoint = { lat: null, lng: null };
  let showEU = true;
  let showUS = true;
  let showCC = true;
  let showEvents = true;
  let route = null;
  let userLocationMarker;
  let circleMinSpaceBetweenPoint;
  let navigationInProgress = false;
  let typesPrises = ["Européenne", "Prise camping-car"];
  let typePrise = "";
  let oldType = "Type de prise";
  let enableToPlace = false;
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
  const customEventIcon = createCustomIcon(
    "./assets/eventSpot.png",
    [50, 50],
    [25, 50],
    [50, 64],
    [4, 62],
    [0, -40]
  );

  const customIconError = createCustomIcon(
    "./assets/elecSpot2-red.png",
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
    [25, 25],
    [0, 60],
    [0, 0],
    [0, 0],
    [15, 0]
  );

  const CCFlagIcon = createCustomIcon(
    "./assets/cc-flag.png",
    [25, 25],
    [0, 60],
    [0, 0],
    [0, 0],
    [15, 0]
  );

  const EventFlagIcon = createCustomIcon(
    "./assets/event-flag.png",
    [25, 25],
    [0, 60],
    [0, 0],
    [0, 0],
    [15, 0]
  );

  const askNewUsername = async () => {
    closePopup();
    showModalEnterNewUsername = true;
  };

  const contactSupport = () => {
    let adresseEmail = "sannier.renaud@gmail.com";
    window.open("mailto:" + adresseEmail);
  };

  const changeUsername = async () => {
    try {
      await axios.post(`${apiUrl}/api/data/modify-username`, {
        username: userPseudo,
        token: userToken,
        idUser: userId,
        newUsername: newUsernameInput,
      });
      localStorage.removeItem("username");
      localStorage.setItem("username", newUsernameInput);
      userPseudo = newUsernameInput;
      newUsernameInput = "";
      showModalEnterNewUsername = false;
      showModalAccountSettings = true;
      refreshPoints();
    } catch (err) {
      console.log(err);
    }
  };

  const seeAllEvents = () => {
    closePopup();
    showIconPanel = false;
    showModalEvents = true;
  };
  const modifyPictureProfil = () => {
 
      const formData = new FormData();
      const imageInput = document.getElementById('imageInput');
      formData.append('file', imageInput.files[0]);
      formData.append('idUser', userId);
      formData.append('token', userToken);
      formData.append('username', userPseudo);
      axios.post(`${apiUrl}/api/data/upload-profil-picture`, formData,{
        headers: {
          'Content-Type': 'multipart/form-data'
        }
        
      })
      .then(response => {
        const pictureImg = document.getElementById("profil-picture-settings")
        userProfilPicture = response.data.user.picture 
        localStorage.setItem('profile-picture', response.data.user.picture)
        pictureImg.src = userProfilPicture
      })
      .catch(error => {

        console.error(error);
      });

  }

  const confirmDeleteAccount = () => {
    closePopup();
    showIconPanel = false;
    showModalConfirmDeleteAccount = !showModalConfirmDeleteAccount;
  };

  const helpIframe = () => {
    window.open(
      "https://support.google.com/maps/answer/144361?hl=fr&co=GENIE.Platform%3DAndroid&oco=1",
      "_blank"
    );
  };

  const createMarker = (coords, icon, draggable, id) => {
    marker = L.marker(coords, {
      icon: icon,
      draggable: draggable,
    });
  };

  const placePoint = async () => {
    closePopup();
    showIconPanel = false;
    map.on("click", async (e) => {
      if (enableToPlace) {
        coordsToAddPoint.lat = e.latlng.lat;
        coordsToAddPoint.lng = e.latlng.lng;
        showModalPlacePoint = false;
        showModalAddPoint = true;
        showIconPanel = false;
        map.off("click");
      }
    });
  };

  const placeEvent = async () => {
    closePopup();
    showIconPanel = false;
    map.on("click", async (e) => {
      if (enableToPlace) {
        coordsToAddPoint.lat = e.latlng.lat;
        coordsToAddPoint.lng = e.latlng.lng;
        showModalPlaceEvent = false;
        showModalCreateEvent = true;
        showIconPanel = false;
        map.off("click");
      }
    });
  };

  const getAllPoints = async () => {
    allPoints = [];
    allEvents = [];
    try {
      const res = await axios.get(`${apiUrl}/api/data/get-all-points`);
      allPoints = res.data;
    } catch (err) {
      console.log(err);
    }
    try {
      const res = await axios.get(`${apiUrl}/api/data/get-all-events`);
      allEvents = res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const getAllEvents = async () => {
    allEvents = [];
    try {
      const res = await axios.get(`${apiUrl}/api/data/get-events`);
      allEvents = res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const goToSettings = () => {
    showModalAccountSettings = true;
  };

  const showSelectedEvent = () => {
    map.setView(selectedEventCoords, 17);
    showModalEventDetails = false;
    showIconPanel = true;
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

  const updateEventCoordinates = async (pointId, lat, lng) => {
    try {
      await axios.post(`${apiUrl}/api/data/update-event-coordinates`, {
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
    markersLayerEvents.clearLayers();
    markersLayerEuropeene.clearLayers();
    markersLayerAmericaine.clearLayers();
    markersLayerCampingCar.clearLayers();
    groupMarkersEvents = [];
    groupMarkersEuropeene = [];
    groupMarkersAmericaine = [];
    groupMarkersCampingCar = [];
    allPoints.forEach((point, index) => {
      if (point.addedBy === userPseudo) {
        myPoints.push(point);
      }
      if (point.priseType === "Européenne") {
        groupMarkersEuropeene.push(point);
      }
      if (point.priseType === "Prise camping-car") {
        groupMarkersCampingCar.push(point);
      }
    });
    allEvents.forEach((event, index) => {
      groupMarkersEvents.push(event);
    });

    function createMarkerAndBindEvents(markerGroup, markersLayer) {
      markerGroup.forEach((point) => {
        let customIconToUse;
        if (point.needValidate) {
          customIconToUse = customIconError;
        } else {
          customIconToUse = customIcon;
        }
        if (point.eventName) {
          customIconToUse = customEventIcon;
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
          showModalAskAction = false;
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
        } else if (point.createdBy == userPseudo) {
          createMarker(pointCoords, customIconToUse, true, pointId);
        } else {
          createMarker(pointCoords, customIconToUse, false, pointId);
        }
        markersLayer.addLayer(marker);
        if (point.priseType === "Européenne") {
          const flagMarker = L.marker(pointCoords, {
            icon: EUFlagIcon,
            draggable: false,
          });
          markersLayer.addLayer(flagMarker);
        }
        if (point.priseType === "Prise camping-car") {
          const flagMarker = L.marker(pointCoords, {
            icon: CCFlagIcon,
            draggable: false,
          });
          markersLayer.addLayer(flagMarker);
        }
        if (point.eventName) {
          const flagMarker = L.marker(pointCoords, {
            icon: EventFlagIcon,
            draggable: false,
          });
          markersLayer.addLayer(flagMarker);
        }

        function isPointCreator(email, username, userId, userToken) {
          if (
            point.eventName === undefined &&
            email === point.email &&
            userId === point.idUser
          ) {
            return `
        <i class="fa-solid fa-pen" style="cursor:pointer; font-size:20px"></i>
        <i class="fa-solid fa-trash-can" style="cursor:pointer; color:red; font-size:20px;"></i>
            `;
          } else {
            // return ` <i class="fa-solid fa-triangle-exclamation" style="cursor:pointer; font-size:20px; color:red"></i>`;
            return ``;
          }
        }

        function isEventCreator(email, username, userId, userToken) {
          if (
            point.eventName !== undefined &&
            email === point.email &&
            userId === point.idUser
          ) {
            return `
        <i class="fa-solid fa-pen" id='modify-event'  style="cursor:pointer; font-size:20px"></i>
        <i class="fa-solid fa-trash-can" id='delete-event' style="cursor:pointer; color:red; font-size:20px;"></i>
            `;
          } else {
            // return ` <i class="fa-solid fa-triangle-exclamation" style="cursor:pointer; font-size:20px; color:red"></i>`;
            return ``;
          }
        }

        function isPointUserReport(
          email,
          username,
          userId,
          userToken,
          pointCreatedBy,
          pointAddedBy,
          pointId
        ) {
          if (email !== point.email && username !== point.addedBy) {
            return `
        <i class="fa-solid fa-flag" id="reportPoint" style="cursor:pointer; font-size:20px; color:red"></i>
            `;
          } else {
            return ``;
          }
        }

        function switchLikePoint(user, like) {
          if (point.likers !== undefined) {
            if (point.likers.includes(user)) {
              return `
      <div style="display: flex; align-items: flex-start;">
       <i class="fa-solid fa-heart" id="dislikeIcone" style="cursor:pointer; font-size:15px; color:pink"></i>
   
      </div>
    `;
            } else {
              return `
      <div style="display: flex; align-items: flex-start;">
            <i class="fa-regular fa-heart" id="likeIcone" style="cursor:pointer; font-size:15px; color:pink"></i>
      </div>
    `;
            }
          }
        }

        function animationEvent() {
          if (point.participation !== null) {
            return `
 <div style="border:solid ;1px; blue;">
    <h4>Animation</h4>
     <span> Prix:  ${
       point.participation ? point.participation : point.participation
     }€</span>
      <p> Description :</p>
       ${
         point.animationDescription
           ? point.animationDescription
           : point.animationDescription
       }</span>
        </p> 
         <label for="inscription">Voir détails</label>
        <input
            type="checkbox"
            id="inscription"
            name="inscription"
            value="inscription"
          />
        </div>
        `;
          } else {
            return ``;
          }
        }

        function RegistrationEvent(user) {
          console.log(point.registration);
          if (
            point.registration !== undefined &&
            point.registration.includes(userId)
          ) {
            return ` 
          <div style="display:flex;  align-items:center; justify-content:center;cursor:pointer">
         <button style="display:flex" id="deregistrationevent"> me desinscrire</button> 
         </div>`;
          } else if (point.eventName) {
            return `
    <div  style="display:flex;  align-items:center; justify-content:center;cursor:pointer">
         <button style="display:flex" id="registrationevent"> Je participe</button> 
         </div>
        `;
          } else {
            return ``;
          }
        }

        function switchLikeUser(user, lovers, haters) {
          if (
            (point.lovers === undefined && point.haters === undefined) ||
            (point.lovers.includes(!user) && point.haters.includes(!user))
          ) {
            return `
      <i class="fa-regular fa-thumbs-down" id="desapprouveIcone" style="cursor:pointer; font-size:15px; color:red"></i>
      <i class="fa-regular fa-thumbs-up" id="approuveIcone" style="cursor:pointer; font-size:15px; color:green"></i>
    `;
          } else if (
            point.lovers.includes(user) ||
            point.haters === undefined
          ) {
            return `
      <i class="fa-solid fa-thumbs-up" id="unapprouveIcone" style="cursor:pointer; font-size:15px; color:green"></i>
    `;
          } else if (
            point.haters.includes(user) ||
            point.lovers === undefined
          ) {
            return `
      <i class="fa-solid fa-thumbs-down" id="undesapprouveIcone" style="cursor:pointer; font-size:15px; color:red"></i>
    `;
          } else {
            return `
      <i class="fa-regular fa-thumbs-down" id="desapprouveIcone" style="cursor:pointer; font-size:15px; color:red"></i>
      <i class="fa-regular fa-thumbs-up" id="approuveIcone" style="cursor:pointer; font-size:15px; color:green"></i>
    `;
          }
        }

        marker.bindPopup(`
        ${point.likers ? switchLikePoint(userId, point.likers) : ""}
        ${
          point.eventName
            ? ``
            : `<img style="width:50px; height:50px; padding-bottom:10px;" class="flag" src="assets/${getImageSource(
                point.priseType
              )}" alt="logo" />`
        }
       
        <br>
        <h3>${point.eventName ? point.eventName : point.pointName}</h3>
        <p>${
          point.eventDescription
            ? point.eventDescription
            : point.pointDescription
            ? point.pointDescription
            : ""
        }</p>

       ${point.eventName ? animationEvent() : ""}

        ${
          point.eventName
            ? `
          <p>Distance : ${point.distance} Km</p>
          `
            : ``
        }
        ${
          point.eventName
            ? `
          <p>${point.startDate} - ${point.endDate}</p>
          `
            : ``
        }
        ${
          point.eventName
            ? `Départ : ${point.startHour} `
            : `<p>Type : ${point.priseType}</p>`
        }
        ${
          point.eventName
            ? `<p>Créer par : ${point.createdBy}</p>`
            : `<p>Ajouté par : ${point.addedBy}</p>`
        }
         ${switchLikeUser(userId, point.lovers, point.haters)}
        <div style="
        display:flex;
        align-items:center;
        justify-content:space-evenly;
        gap:1rem;
        margin-top:1rem;
        margin-bottom:1.5rem;
        ">
        <i class="fa-solid fa-route" style="cursor:pointer; font-size:20px"></i>
        <i class="fa-solid fa-eye" id="see-point" style="cursor:pointer; font-size:20px"></i>
        ${isPointCreator(userMail, userPseudo, userId, userToken)}
        ${isEventCreator(userMail, userPseudo, userId, userToken)}
        ${isPointUserReport(
          userMail,
          userPseudo,
          userId,
          userToken,
          point.createdBy,
          point.addedBy,
          point._id
        )}
         </div>
         ${RegistrationEvent()}
     
       `);
        function getImageSource(priseType) {
          switch (priseType) {
            case "Européenne":
              oldType = "Européenne";
              return "eu-flag.png";
            case "Prise camping-car":
              oldType = "Prise camping-car";
              return "cc-flag.png";
            default:
              return "";
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

        marker.on("dragend", (event) => {
          selectedMarker = point;
          const newCoords = event.target.getLatLng();
          updatePointCoordinates(pointId, newCoords.lat, newCoords.lng);
          updateEventCoordinates(pointId, newCoords.lat, newCoords.lng);
        });

        marker.on("popupopen", (event) => {
          if (point.email === userMail && point.addedBy === userPseudo) {
            const penIcon = document.querySelector(".fa-pen");
            const trashIcon = document.querySelector(".fa-trash-can");
            penIcon?.addEventListener("click", async () => {
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
            trashIcon?.addEventListener("click", async () => {
              const userMail = localStorage.getItem("email");
              if (userId !== point.idUser) {
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

          const deleteEvent = document.getElementById("delete-event");
          deleteEvent?.addEventListener("click", async () => {
            if (deleteEvent && userId === point.idUser) {
              map.closePopup();
              showConfirmDeleteEvent = true;
            } else {
              alert(
                "Vous n'etes pas le createur de cette event, vous ne pouvez pas le supprimer"
              );
              map.closePopup();
              return;
            }
          });
          const getModifyEvent = document.getElementById("modify-event");

          getModifyEvent?.addEventListener("click", () => {
            if (getModifyEvent) {
              idEventToUpdate = point._id;
              nameEventInput = point.eventName;
              descriptionEventInput = point.eventDescription;
              informationsEventInput = point.eventInformations;
              animationDescription = point.animationDescription;
              participationFee = point.participation;
              startDateEventInput = point.startDate;
              endDateEventInput = point.endDate;
              startHourEventInput = point.startHour;
              iframeEventInput = point.iframe;
              distanceEventInput = point.distance;
              oldType = point.priseType;
              showModalModifyInfoEvent = true;
            } else {
              alert(
                "Vous n'etes pas le createur de cet event, vous ne pouvez pas le modifier"
              );
              map.closePopup();
              return;
            }
          });

          const likeIcon = document.getElementById("likeIcone");
          if (likeIcon) {
            likeIcon.addEventListener("click", async () => {
              await axios
                .post(`${apiUrl}/api/data/like-point`, {
                  token: userToken,
                  idUser: userId,
                  idPoint: selectedMarker,
                })
                .then((data) => {
                  refreshPoints();
                  console.log(data);
                });
            });
          }

          const dislikeIcone = document.getElementById("dislikeIcone");
          if (dislikeIcone) {
            dislikeIcone.addEventListener("click", async () => {
              await axios
                .post(`${apiUrl}/api/data/dislike-point`, {
                  token: userToken,
                  idUser: userId,
                  idPoint: selectedMarker,
                })
                .then((data) => {
                  refreshPoints();
                  console.log(data);
                });
            });
          }

          const approuveIcone = document.getElementById("approuveIcone");
          if (approuveIcone) {
            approuveIcone.addEventListener("click", async () => {
              await axios
                .post(`${apiUrl}/api/auth/likeUser`, {
                  token: userToken,
                  idUser: userId,
                  idPoint: selectedMarker,
                })
                .then((data) => {
                  refreshPoints();
                  console.log(data);
                });
            });
          }

          const unapprouveIcone = document.getElementById("unapprouveIcone");
          if (unapprouveIcone) {
            unapprouveIcone.addEventListener("click", async () => {
              await axios
                .post(`${apiUrl}/api/auth/unlikeUser`, {
                  token: userToken,
                  idUser: userId,
                  idPoint: selectedMarker,
                })
                .then((data) => {
                  refreshPoints();
                  console.log(data);
                });
            });
          }

          const desapprouveIcone = document.getElementById("desapprouveIcone");
          if (desapprouveIcone) {
            desapprouveIcone.addEventListener("click", async () => {
              await axios
                .post(`${apiUrl}/api/auth/dislikeUser`, {
                  token: userToken,
                  idUser: userId,
                  idPoint: selectedMarker,
                })
                .then((data) => {
                  refreshPoints();
                  console.log(data);
                });
            });
          }

          const undesapprouveIcone =
            document.getElementById("undesapprouveIcone");
          if (undesapprouveIcone) {
            undesapprouveIcone.addEventListener("click", async () => {
              await axios
                .post(`${apiUrl}/api/auth/undislikeUser`, {
                  token: userToken,
                  idUser: userId,
                  idPoint: selectedMarker,
                })
                .then((data) => {
                  refreshPoints();
                  console.log(data);
                });
            });
          }
          const getDetail = () => {
            if (point.eventName) {
              ({
                eventName: selectedEventName,
                eventDescription: selectedEventDescription,
                eventInformations: selectedEventInformations,
                animationDescription: selectedEventDescriptionAnimation,
                participation: selectedEventParticipationFee,
                registration: selectedEventRegistration,
                iframe: selectedEventIframe,
                distance: selectedEventDistance,
                startDate: selectedEventStartDate,
                endDate: selectedEventEndDate,
                startHour: selectedEventStartHour,
                coords: selectedEventCoords,
                createdBy: selectedEventCreatedBy,
              } = point);
              showModalEventDetails = true;
            }
          };

          const detailAnimation = document.getElementById("inscription");
          detailAnimation?.addEventListener("click", () => {
            getDetail();
          });

          const eyeIcon = document.getElementById("see-point");
          eyeIcon?.addEventListener("click", () => {
            getDetail();
          });

          const RegitrationEvent = document.getElementById("registrationevent");
          if (RegitrationEvent) {
            RegitrationEvent?.addEventListener("click", async () => {
              await axios
                .post(`${apiUrl}/api/data/registration-event`, {
                  token: userToken,
                  idUser: userId,
                  idEvent: point._id,
                })
                .then((data) => {
                  console.log(data);
                  refreshPoints();
                });
            });
          }

          const deRegitrationEvent = document.getElementById(
            "deregistrationevent"
          );
          if (deRegitrationEvent) {
            deRegitrationEvent?.addEventListener("click", async () => {
              await axios
                .post(`${apiUrl}/api/data/deregistration-event`, {
                  token: userToken,
                  idUser: userId,
                  idEvent: point._id,
                })
                .then((data) => {
                  refreshPoints();
                  console.log(data);
                });
            });
          }

          const routeIcon = document.querySelector(".fa-route");
          routeIcon?.addEventListener("click", async () => {
            function redirectToGoogleMapsBike(lat, lng) {
              const googleMapsURL = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=bicycling`;
              window.open(googleMapsURL, "_blank");
            }
            redirectToGoogleMapsBike(
              selectedMarker.coords.lat,
              selectedMarker.coords.lng
            );
            closePopup();
          });

          const reportIcon = document.getElementById("reportPoint");
          reportIcon?.addEventListener("click", async () => {
            closePopup();
            showModalReportPointFirstStep = true;
          });
        });
      });
    }
    createMarkerAndBindEvents(groupMarkersEvents, markersLayerEvents);
    createMarkerAndBindEvents(groupMarkersEuropeene, markersLayerEuropeene);
    createMarkerAndBindEvents(groupMarkersAmericaine, markersLayerAmericaine);
    createMarkerAndBindEvents(groupMarkersCampingCar, markersLayerCampingCar);
  };

  const reportPointConfirm = async () => {
    const commentTextarea = document.getElementById("commentReport");
    commentReport = commentTextarea.value;
    await axios
      .post(`${apiUrl}/api/report/reportPoint`, {
        idPoint: selectedMarker,
        idUser: userId,
        comment: commentReport,
      })
      .then((res, err) => {
        if (res) {
          showModalReportPointTwoStep = !showModalReportPointTwoStep;
          commentReport = "";
          showModalReportPointConfirm = true;
          closePopUpTimer();
        }
      })
      .catch((err) => {
        closePopup();
        showModalReportPointError = true;
        closePopUpTimerError();
        console.log(err);
      });
  };

  const modifyEvent = async () => {
    closePopup();
    if(iframeEventInput !== ''){
      var iframeString = iframeEventInput;
      const iframeRegex =
      /<iframe\s+src="https:\/\/www\.google\.com\/maps\/embed[^\n]*<\/iframe>/i;
      if (!iframeRegex.test(iframeString)) {
        alert(
          "Veuillez entrer une balise iframe avec une source Google Maps valide."
          );
          showIconPanel = false;
          showModalCreateEvent = true;
          return;
        }
        var srcMatch = iframeString.match(/src="([^"]+)"/);
        if (srcMatch) var iframeLink = srcMatch[1];
        else iframeLink = ''
        function isValidDistance(distance) {
          return !isNaN(parseFloat(distance)) && isFinite(distance);
        }
        
      }
    function isValidDistance(distance) {
      return !isNaN(parseFloat(distance)) && isFinite(distance);
    }
    const formatDate = (date) => {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };
    const isTimeAfterCurrentTime = (time) => {
      const [hour, minute] = time.split(":");
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      return (
        parseInt(hour, 10) > currentHour ||
        (parseInt(hour, 10) === currentHour &&
          parseInt(minute, 10) > currentMinute)
      );
    };
    closePopup();

    try {
      const distance = parseFloat(distanceEventInput);

      if (!isValidDistance(distance)) {
        alert("La distance doit être au format numérique");
        showIconPanel = false;
        showModalCreateEvent = true;
      } else if (
        new Date(startDateEventInput).getDate() === new Date().getDate() &&
        !isTimeAfterCurrentTime(startHourEventInput)
      ) {
        alert("La date de début doit être postérieure à la date actuelle");
        showIconPanel = false;
        showModalCreateEvent = true;
      } else if (
        !isTimeAfterCurrentTime(startHourEventInput) &&
        new Date(startDateEventInput).getDate() === new Date().getDate()
      ) {
        alert("L'heure de début doit être postérieure à l'heure actuelle");
        showIconPanel = false;
        showModalCreateEvent = true;
      } else {
        const res = await axios
          .post(`${apiUrl}/api/data/modify-event`, {
            idEventToUpdate: selectedMarker._id,
            token: userToken,
            idUser: userId,
            createdBy: userPseudo,
            email: userMail,
            eventName: nameEventInput,
            eventDescription: descriptionEventInput,
            eventInformations: informationsEventInput,
            participation: participationFee,
            animationDescription: animationDescription,
            coords: {
              lat: coordsToAddPoint.lat,
              lng: coordsToAddPoint.lng,
            },
            distance: distanceEventInput,
            iframe: iframeLink,
            startDate: formatDate(new Date(startDateEventInput)),
            endDate: formatDate(new Date(endDateEventInput)),
            startHour: startHourEventInput,
            addedDate: new Date(),
            needValiate: true,
          })
          .then((res) => {
            if (res) {
              alert("Événement créé avec succès");
              refreshPoints();
              closePopup();
            }
          });
      }
    } catch (err) {
      console.error(err);
      alert(
        "Une erreur s'est produite lors de la création de l'événement. Veuillez réessayer plus tard."
      );
    }
    nameEventInput = "";
    hasAnimation = false;
    hasInscription = false;
    descriptionEventInput = "";
    distanceEventInput = "";
    participationFee = "";
    animationDescription = "";
    startDateEventInput = "";
    endDateEventInput = "";
    startHourEventInput = "";
    iframeEventInput = "";
    informationsEventInput = "";
  };

  const closePopup = () => {
    map.closePopup();
    showModalAddPoint = false;
    showModalAskAction = false;
    showModalModifyInfo = false;
    showModalModifyInfoEvent = false;
    showConfirmDelete = false;
    showConfirmDeleteEvent = false;
    showModalFilter = false;
    showModalSettings = false;
    showModalEvents = false;
    showModalCreateEvent = false;
    showModalPlacePoint = false;
    showModalPlaceEvent = false;
    showModalEventDetails = false;
    showModalAccountSettings = false;
    showModalReportPointFirstStep = false;
    showModalReportPointTwoStep = false;
    showModalReportPointConfirm = false;
    showModalReportPointError = false;
    showModalConfirmDeleteAccount = false;
    showModalEnterNewUsername = false;
    showIconPanel = true;
    showModalAnimation = false;
  };

  const closePopUpTimer = () => {
    setTimeout(() => {
      closePopup();
    }, 2000);
  };

  const closePopUpTimerError = () => {
    setTimeout(() => {
      closePopup();
    }, 4000);
  };

  const reopenModaleEvent = () => {
    showModalCreateEvent = true;
  };

  const addPoint = () => {
    namePointInput = "";
    descriptionPointInput = "";
    showModalAskAction = false;
    showModalPlacePoint = true;
    showIconPanel = false;
    enableToPlace = true;
  };

  const addEvent = () => {
    namePointInput = "";
    descriptionPointInput = "";
    showModalAskAction = false;
    showModalPlaceEvent = true;
    showIconPanel = false;
    enableToPlace = true;
  };

  const createEvent = async () => {
    closePopup();
    if(iframeEventInput !==''){

      var iframeString = iframeEventInput;
      const iframeRegex =
        /<iframe\s+src="https:\/\/www\.google\.com\/maps\/embed[^\n]*<\/iframe>/i;
      if (!iframeRegex.test(iframeString)) {
        alert(
          "Veuillez entrer une balise iframe avec une source Google Maps valide."
        );
        showIconPanel = false;
        showModalCreateEvent = true;
        return;
      }
      var srcMatch = iframeString.match(/src="([^"]+)"/);
      if (srcMatch) var iframeLink = srcMatch[1];
      else iframeLink = ''
    }
    function isValidDistance(distance) {
      return !isNaN(parseFloat(distance)) && isFinite(distance);
    }

    const formatDate = (date) => {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    const isTimeAfterCurrentTime = (time) => {
      const [hour, minute] = time.split(":");
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      return (
        parseInt(hour, 10) > currentHour ||
        (parseInt(hour, 10) === currentHour &&
          parseInt(minute, 10) > currentMinute)
      );
    };

    const resetFields = () => {
      const fieldsToReset = [
        "nameEventInput",
        "descriptionEventInput",
        "distanceEventInput",
        "participationFee",
        "descriptionAnimation",
        "startDateEventInput",
        "endDateEventInput",
        "startHourEventInput",
        "iframeEventInput",
        "descriptionPointInput",
      ];

      fieldsToReset.forEach((field) => {
        window[field] = ""; // Réinitialise les champs à une chaîne vide
      });
    };

    closePopup();
    try {
      const distance = parseFloat(distanceEventInput);

      if (!isValidDistance(distance)) {
        alert("La distance doit être au format numérique");
        showIconPanel = false;
        showModalCreateEvent = true;
      } else if (
        new Date(startDateEventInput).getDate() === new Date().getDate() &&
        !isTimeAfterCurrentTime(startHourEventInput)
      ) {
        alert("La date de début doit être postérieure à la date actuelle");
        showIconPanel = false;
        showModalCreateEvent = true;
      } else if (
        !isTimeAfterCurrentTime(startHourEventInput) &&
        new Date(startDateEventInput).getDate() === new Date().getDate()
      ) {
        alert("L'heure de début doit être postérieure à l'heure actuelle");
        showIconPanel = false;
        showModalCreateEvent = true;
      } else {
        const res = await axios
          .post(`${apiUrl}/api/data/create-event`, {
            token: userToken,
            idUser: userId,
            createdBy: userPseudo,
            email: userMail,
            eventName: nameEventInput,
            eventDescription: descriptionEventInput,
            eventInformations: informationsEventInput,
            participation: participationFee,
            animationDescription: animationDescription,
            coords: {
              lat: coordsToAddPoint.lat,
              lng: coordsToAddPoint.lng,
            },
            distance: distanceEventInput,
            iframe: iframeLink,
            startDate: formatDate(new Date(startDateEventInput)),
            endDate: formatDate(new Date(endDateEventInput)),
            startHour: startHourEventInput,
            addedDate: new Date(),
            needValiate: true,
          })
          .then((res) => {
            if (res) {
              alert("Événement créé avec succès");
              nameEventInput = "";
              hasAnimation = false;
              hasInscription = false;
              descriptionEventInput = "";
              distanceEventInput = "";
              participationFee = "";
              animationDescription = "";
              startDateEventInput = "";
              endDateEventInput = "";
              startHourEventInput = "";
              iframeEventInput = "";
              informationsEventInput = "";
              refreshPoints();
              closePopup();
            }
          });
      }
    } catch (err) {
      console.error(err);
      alert(
        "Une erreur s'est produite lors de la création de l'événement. Veuillez réessayer plus tard."
      );
    }

    enableToPlace = false;
  };

  function getViewportSize() {
    return {
      width:
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth,
      height:
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight,
    };
  }

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  const settings = () => {
    showModalSettings = !showModalSettings;
    showIconPanel = false;
  };

  const goToUserLocation = () => {
    map.setView(userCoords, 17);
    setInterval(() => {
      updateUserCoords();
    }, 2000);
  };

  const showEventDetails = (
    createdBy,
    email,
    eventName,
    eventDescription,
    eventInformations,
    descriptionAnimation,
    participationFee,
    registration,
    distance,
    iframe,
    coords,
    startDate,
    endDate,
    startHour
  ) => {
    selectedEventCreatedBy = createdBy;
    selectedEventEmail = email;
    selectedEventName = eventName;
    selectedEventDescription = eventDescription;
    selectedEventInformations = eventInformations;
    selectedEventDescriptionAnimation = descriptionAnimation;
    selectedEventParticipationFee = participationFee;
    selectedEventRegistration = registration;
    selectedEventDistance = distance;
    selectedEventIframe = iframe;
    selectedEventCoords = coords;
    selectedEventStartDate = startDate;
    selectedEventEndDate = endDate;
    selectedEventStartHour = startHour;
    showModalEvents = false;
    showModalEventDetails = true;
    console.log(selectedEventIframe)
  };

  const events = () => {
    getAllEvents();
    showModalEvents = !showModalEvents;
    showIconPanel = false;
  };

  function getCenterOfViewport() {
    var viewportSize = getViewportSize();
    return map.containerPointToLatLng([
      viewportSize.width / 2,
      viewportSize.height / 2,
    ]);
  }

  const addPointByPlus = (latlng) => {
    var center = getCenterOfViewport();
    closePopup();
    map.closePopup();
    latPointToAdd = center.lat;
    lngPointToAdd = center.lng;
    showModalAskAction = true;
    showIconPanel = false;
  };

  const submitInfoPoint = async (lat, lng) => {
    await axios
      .post(`${apiUrl}/api/data/add-point`, {
        token: userToken,
        idUser: userId,
        email: userMail,
        pointName: namePointInput,
        pointDescription: descriptionPointInput,
        coords: {
          lat: coordsToAddPoint.lat,
          lng: coordsToAddPoint.lng,
        },
        addedBy: localStorage.getItem("username"),
        priseType: typePrise,
        addedDate: new Date(),
        needValiate: true,
      })
      .then(() => {
        namePointInput = "";
        descriptionPointInput = "";
        typePrise = "";
        refreshPoints();
        closePopup();
        enableToPlace = false;
      })
      .catch((err) => {
        closePopup();
        showModalReportPointError = true;
        closePopUpTimerError();
      });
  };

  const confirmModify = async () => {
    await axios
      .post(`${apiUrl}/api/data/modify-point`, {
        token: userToken,
        idUser: userId,
        pointId: selectedMarker._id,
        pointName: namePointInput,
        pointDescription: descriptionPointInput,
        priseType: typePrise,
      })
      .then(async (res) => {
        typePrise = "";
        await refreshPoints();
        showModalModifyInfo = false;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const confirmDelete = async () => {
    await axios.post(`${apiUrl}/api/data/delete-point`, {
      token: userToken,
      idUser: userId,
      pointId: selectedMarker._id,
    });
    await refreshPoints();
    showConfirmDelete = false;
  };

  const confirmDeleteEvent = async () => {
    await axios.post(`${apiUrl}/api/data/delete-event`, {
      token: userToken,
      idUser: userId,
      eventId: selectedMarker._id,
    });
    await refreshPoints();
    showConfirmDeleteEvent = false;
  };

  const showFilter = () => {
    showModalFilter = !showModalFilter;
    showIconPanel = false;
  };
  let isStartDateInput = false;
  let isEndDateInput = false;
  let isStartHourInput = false;
  let activeInput = null;

  function toggleStartDateInput() {
    isStartDateInput = true;
  }

  function toggleEndDateInput() {
    isEndDateInput = true;
  }

  function toggleStartHourInput() {
    isStartHourInput = true;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Les mois sont indexés à partir de 0
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  function isDateValid(inputDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDateObj = new Date(inputDate);
    if (inputDateObj < today) {
      return false;
    } else {
      return true;
    }
  }

  $: formattedStartDate = formatDate(startDateEventInput);
  $: formattedEndDate = formatDate(endDateEventInput);

  const toggleEU = () => {
    showEU = !showEU;
    if (showEU) {
      markersLayerEuropeene.addTo(map);
    } else {
      markersLayerEuropeene.removeFrom(map);
    }
    localStorage.setItem("showEU", showEU);
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

  const toggleEvent = () => {
    showEvents = !showEvents;
    if (showEvents) {
      markersLayerEvents.addTo(map);
    } else {
      markersLayerEvents.removeFrom(map);
    }
    localStorage.setItem("showEvents", showEvents);
  };

  userCoords = [48.8588443, 2.2943506];
  const updateUserCoords = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        userCoords = [position.coords.latitude, position.coords.longitude];
        currentCoords = userCoords;
        userLocationMarker.setLatLng(userCoords);
      });
    } else {
      console.error("Geolocation is not available in this browser.");
    }
  };

  const goToMyAddedPoint = (coords) => {
    closePopup();
    console.log(coords);
    map.setView([coords.lat, coords.lng], 20);
  };

  onMount(async () => {

    let deferredPrompt;
if(window.innerWidth < 768){ 


  window.addEventListener('beforeinstallprompt', (event) => {

    deferredPrompt = event;
    
    // Vérifier si l'application est déjà installée
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      showIconPanel = false
      showInstallPrompt();
    } else {
      // L'application est déjà installée, vous pouvez vérifier une mise à jour ici
      showInstallPrompt();
    }
  });
  
  function showInstallPrompt() {
    if (!document.querySelector('#install-button')) {
      const divPopupInstall = document.createElement('div');
      divPopupInstall.classList.add('div-install');
      divPopupInstall.innerHTML = `
      <p>Pour une expérience optimale, installez l'application :</p>
      `;

    const installButton = document.createElement('button');
    installButton.classList.add('install-btn');
    installButton.textContent = "Installer";
    installButton.id = 'install-button';
    divPopupInstall.appendChild(installButton);
    
    installButton.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          // L'utilisateur a accepté l'installation
        } else {
          // L'utilisateur a refusé l'installation
        }
        deferredPrompt = null;
        divPopupInstall.remove();
        showIconPanel = true
      });
    });
    
    const cancelInstallButton = document.createElement('button');
    cancelInstallButton.classList.add('cancel-install-btn');
    cancelInstallButton.textContent = "Plus tard";
    cancelInstallButton.id = 'cancel-install-button';
    divPopupInstall.appendChild(cancelInstallButton);
    
    cancelInstallButton.addEventListener('click', () => {
      divPopupInstall.remove();
      showIconPanel = true

    });
    
    document.body.appendChild(divPopupInstall);
  }
}

function checkForUpdate() {
  // Vous pouvez implémenter ici la logique de vérification de mise à jour
  // Si une mise à jour est disponible, affichez un message approprié
  // sinon, vous pouvez masquer la bannière d'installation
}
}


    let showEuLocalStorage = localStorage.getItem("showEU");
    let showCcLocalStorage = localStorage.getItem("showCC");
    let showEventsLocalStorage = localStorage.getItem("showEvents");

    map = L.map("map");
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.setView([48.85120324709899, 2.344], 10);
    markersLayerEvents = L.layerGroup().addTo(map);
    markersLayerEuropeene = L.layerGroup().addTo(map);
    markersLayerAmericaine = L.layerGroup().addTo(map);
    markersLayerCampingCar = L.layerGroup().addTo(map);
    await getAllPoints();
    await refreshPoints();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        userCoords = [position.coords.latitude, position.coords.longitude];
        map.setView(userCoords, 17);
        userLocationMarker = L.marker(userCoords, {
          icon: myLocationIcon,
        }).addTo(map);
      });
    } else {
      console.error("Geolocation is not available in this browser.");
    }
    map.on("click", (e) => {
      if (pressed) {
        pressed = false;
        return;
      } else {
        closePopup();
        map.closePopup();
      }
    });

    if (showEuLocalStorage) {
      showEU = showEuLocalStorage === "true" ? true : false;
      showEuLocalStorage === "true"
        ? markersLayerEuropeene.addTo(map)
        : markersLayerEuropeene.removeFrom(map);
    }
    if (showCcLocalStorage) {
      showCC = showCcLocalStorage === "true" ? true : false;
      showCcLocalStorage === "true"
        ? markersLayerCampingCar.addTo(map)
        : markersLayerCampingCar.removeFrom(map);
    }
    if (showEventsLocalStorage) {
      showEvents = showEventsLocalStorage === "true" ? true : false;
      showEventsLocalStorage === "true"
        ? markersLayerEvents.addTo(map)
        : markersLayerEvents.removeFrom(map);
    }
  });
  const confirmEventParticipation = () => {
    alert("gerg");
  };
</script>

{#if !lockView && navigationInProgress}
  <div>
    <img
      id="lock-view"
      src="./assets/icons/lock-view.png"
      alt=""
      srcset=""
      on:click={lockViewHandler}
    />
  </div>
{/if}


{#if showStartRoute}
  <div id="resume-route">
    <img
      id="start-icon"
      src="./assets/icons/play.png"
      alt=""
      srcset=""
      on:click={setNavigationView}
    />
  </div>
{/if}

{#if navigationInProgress}
  <div id="resume-route">
    <img
      id="stop-icon"
      src="./assets/icons/stop.png"
      alt=""
      srcset=""
      on:click={stopNavigation}
    />
  </div>
{/if}

{#if showIconPanel}
  <img
    id="settings-icon"
    src="./assets/icons/gear.png"
    alt=""
    srcset=""
    on:click={settings}
  />
  <img
    id="events-icon"
    src="./assets/icons/list.png"
    alt=""
    srcset=""
    on:click={events}
  />

  <div id="icons-interface">
    <img
      id="plus-icon"
      src="./assets/icons/plus.png"
      alt=""
      srcset=""
      on:click={addPointByPlus}
    />
    <img
      id="eye-icon"
      src="./assets/icons/eye.png"
      alt=""
      srcset=""
      on:click={showFilter}
    />

    <img
      id="location-icon"
      src="./assets/icons/location.png"
      alt=""
      srcset=""
      on:click={goToUserLocation}
    />
  </div>
{/if}

{#if showModalEventDetails}
  <div id="container-event-details">
    <i class="fa-solid fa-xmark" on:click={closePopup} />
    <h3>{selectedEventName}</h3>
    <p>{selectedEventDescription}</p>
    <p style="max-width:90vw">
      Infos : {selectedEventInformations}
    </p>
    {#if selectedEventParticipationFee !== undefined}
      <div style="display: flex; flex-direction: column; align-items: center; ">
        <h3 style="display: flex; align-items: center;color:red;">
          <i
            class="fa-solid fa-triangle-exclamation"
            style="margin-right: 8px;"
          />
          <span>Evenement Payant</span>
        </h3>
        <p>Participation : {selectedEventParticipationFee} €</p>
        <p>Animation : {selectedEventDescriptionAnimation}</p>
        <p>
          <span>Vous inscrire :</span>
          <input
            type="checkbox"
            id="inscription"
            name="inscription"
            value="inscription"
            bind:checked={hasInscription}
          />
          {#if hasInscription === true}
            <div
              class="animation-dropdown"
              style="display: flex; flex-direction: column; align-items: center; "
            >
              <input
                type="number"
                min="0"
                placeholder="Je participe à combien ?"
                bind:value={userParticipationFee}
              />
              <textarea
                placeholder="J'apporte quoi ?"
                rows="4"
                bind:value={giveDescription}
              />
              <button
                type="submit"
                class="confirm-btn"
                style="color:black"
                on:click={confirmEventParticipation}>Valider</button
              >
              <button
                type="submit"
               class="cancel-btn"
                style="background-color: var(--red-error); width: 100%;"
                on:click={() => (hasInscription = false)}>Annuler</button
              >
            </div>
          {/if}
        </p>
      </div>
    {/if}
    {#if selectedEventIframe}
      <iframe
        id="route-viewer"
        src={selectedEventIframe}
        width="600"
        height="450"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
    {/if}
    <p>Distance : {selectedEventDistance} km</p>
    <p>Départ : {selectedEventStartHour}</p>
    <p>Dates : {selectedEventStartDate} - {selectedEventEndDate}</p>
    <p>
      Point de rassemblement :<i
        style="cursor: pointer; margin-left: 10px"
        class="fa-solid fa-eye"
        on:click={showSelectedEvent}
      />
    </p>

    <p>Créer par : {selectedEventCreatedBy}</p>
    <!-- <button on:click={inscriptionEvent}>Je participe</button>  -->
  </div>
{/if}
<div id="filter" />

{#if showModalPlacePoint}
  <div id="container-place-point">
    <i class="fa-solid fa-xmark" on:click={closePopup} />

    <p>Selectionnez l'emplacement du point.</p>
    <p>(vous pourrez le déplacer avant validation)</p>
    <button on:click={placePoint}>+</button>
  </div>
{/if}

{#if showModalPlaceEvent}
  <div id="container-place-point">
    <i class="fa-solid fa-xmark" on:click={closePopup} />

    <p>Selectionnez l'emplacement du point.</p>
    <button on:click={placeEvent}>+</button>
  </div>
{/if}

{#if showModalReportPointError}
  <div id="container-remove-point">
    <div>
      <p>Oupss il y a une erreur</p>
      <p>Veuillez recommencer dans un moment</p>
      <p>Si le probleme persiste contacter le support</p>
    </div>

    <div />
  </div>
{/if}

{#if showModalReportPointFirstStep}
  <div id="container-remove-point">
    <div>
      <p>Voulez vous signaler ce point ?</p>
    </div>
    <div id="action-delete">
      <button
        type="submit"
        class="confirm-btn"
        on:click={() => {
          closePopup(), (showModalReportPointTwoStep = true);
        }}>Oui</button
      >
      <button type="submit" class="cancel-btn" on:click={closePopup}>Non</button>
    </div>
    <div />
  </div>
{/if}

{#if showModalReportPointTwoStep}
  <div id="container-remove-point">
    <div>
      <p>Quel est la raison ?</p>
    </div>
    <div>
      <textarea id="commentReport" maxlength="200" />
    </div>

    <div id="action-delete">
      <button type="submit" id="confirm-delete" on:click={reportPointConfirm}
        >Confirmer</button
      >
      <button type="submit" id="cancel-delete" on:click={closePopup}
        >Annuler</button
      >
    </div>
    <div />
  </div>
{/if}

{#if showModalReportPointConfirm}
  <div id="container-remove-point">
    <div>
      <p>Votre signalement à bien été pris en compte</p>
      <p>Merci et bon ride</p>
    </div>
    <div />
  </div>
{/if}

{#if showModalSettings}
  <div id="container-settings">
    <i class="fa-solid fa-xmark" on:click={closePopup} />
    <div id="header-settings">
      <div>
        <img
          id="profil-picture-settings"
          src={userProfilPicture}
          alt=""
          srcset=""
        />
        <h2 style='color:white; font-weight: bold; text-align:center;'>{userPseudo}</h2>
      </div>
    </div>
    <div id="action-settings">
      <!-- <div class="btn-settings">Social</div> -->
      <div class="btn-settings" on:click={goToSettings}>Paramètres</div>
    </div>
    <div id="footer-settings">
      <h2 style="color:white;">Mes points ajoutés : ({myPoints.length})</h2>
      {#each myPoints as { pointName, coords }, i}
        <div on:click={(e) => goToMyAddedPoint(coords)} class="posted-point">
          <p>{pointName}</p>
        </div>
      {/each}s
    </div>
  </div>
{/if}

{#if showModalEvents}
  <div id="container-events">
    <i class="fa-solid fa-xmark" on:click={closePopup} />
    <h2 style="color:white; ">Événements à venir :</h2>

    <div id="list-events">
      {#each allEvents as { createdBy, email, eventName, eventDescription, eventInformations, descriptionAnimation, participation,registration, distance, iframe, coords, startDate, endDate, startHour }, i}
        <div
          on:click={showEventDetails(
            createdBy,
            email,
            eventName,
            eventDescription,
            eventInformations,
            descriptionAnimation,
            participationFee,
            registration,
            distance,
            iframe,
            coords,
            startDate,
            endDate,
            startHour
          )}
          class="posted-events"
        >
          <h2>{eventName}</h2>
          <h3>{eventDescription}</h3>
          <h3>{startDate} - {endDate}</h3>
          <h3>Départ : {startHour}</h3>
          <div>
            attention event avec animation :
            {animationDescription}
            Prix:
            {participation}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if showModalFilter}
  <div id="container-filter">
    <i class="fa-solid fa-xmark" on:click={closePopup} />

    <div id="EU-filter">
      <img src="./assets/eu-flag.png" style="width:25px" alt="" srcset="" />
      <p>
        Européenne ({groupMarkersEuropeene.length})
      </p>
      {#if showEU}
        <i class="fa-solid fa-eye" on:click={toggleEU} />
      {:else}
        <i class="fa-solid fa-eye-slash" on:click={toggleEU} />
      {/if}
    </div>
    <div id="CC-filter">
      <img src="./assets/cc-flag.png" style="width:25px" alt="" srcset="" />
      <p>
        Camping-car ({groupMarkersCampingCar.length})
      </p>
      {#if showCC}
        <i class="fa-solid fa-eye" on:click={toggleCC} />
      {:else}
        <i class="fa-solid fa-eye-slash" on:click={toggleCC} />
      {/if}
    </div>
    <div id="Event-filter">
      <img src="./assets/event-flag.png" style="width:25px" alt="" srcset="" />

      <p>
        Evénements ({groupMarkersEvents.length})
      </p>
      {#if showEvents}
        <i class="fa-solid fa-eye" on:click={toggleEvent} />
      {:else}
        <i class="fa-solid fa-eye-slash" on:click={toggleEvent} />
      {/if}
    </div>
    <div />
  </div>
{/if}

{#if showModalAccountSettings}
  <div id="container-account-settings">
    <i class="fa-solid fa-xmark" on:click={closePopup} />
    <div id="header-account-settings">
      <div id='photo-container-settings'>
        <img
        id="profil-picture-account-settings"
        src={userProfilPicture}
        />
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input on:change={modifyPictureProfil} style='display:none' type="file" name="image" id="imageInput">
          <label for="imageInput">
            <i class="fa-solid fa-pen" id="modify-image-settings" />
          </label>
        </form>
      </div>
      <!-- <button type="button" on:click={modifyPictureProfil}>Envoyer</button> -->

      <br />
      <div id="pseudo-account-settings">
        <h2>{userPseudo}</h2>
        <i class="fa-solid fa-pen" id="modify-pseudo-settings" on:click={() => {closePopup(); showIconPanel = false; showModalEnterNewUsername = true}}/>
      </div>
    </div>
    <div id="action-account-settings">

      <div class="sub-action-account-settings">
        <h3 style="margin:5px 0">Aide</h3>
        <p style="margin:0; cursor: pointer" on:click={contactSupport}>Contacter le support</p>
      </div>
    </div>
    <div id="footer-account-settings" />
    <p style="margin:0; cursor: pointer" on:click={logout}>Déconnexion</p>

    <!-- <p style="color:red ; margin:0; cursor:pointer;"on:click={() => {closePopup(); showIconPanel = false; showModalConfirmDeleteAccount = true}}>Supprimer mon compte</p> -->
  </div>
  <i class="fa-solid fa-xmark" on:click={closePopup} />
{/if}

{#if showModalConfirmDeleteAccount}
  <div id="container-remove-point">
    <div>
      <p>Voulez vous vraiment supprimer votre compte ?</p>
      <p style="color:red">Cette action est irréversible.</p>
    </div>
    <div id="action-delete">
      <button type="submit" id="confirm-delete">Oui</button>
      <button type="submit" id="cancel-delete" on:click={()=> {closePopup(); showIconPanel = false; showModalAccountSettings = true}}>Non</button
      >
    </div>
    <div />
  </div>
{/if}

{#if showModalEnterNewUsername}
  <div id="container-remove-point">
    <div>
      <input
        type="text"
        name=""
        id=""
        placeholder={userPseudo}
        bind:value={newUsernameInput}
      />
    </div>
    <div id="action-delete">
      <button type="submit" id="confirm-delete" on:click={changeUsername}
        >Confirmer</button
      >
      <button
        type="submit"
        id="cancel-delete"
        on:click={() => {
          closePopup();
          showModalAccountSettings = true;
        }}>Annuler</button
      >
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

{#if showConfirmDeleteEvent}
  <div id="container-remove-point">
    <div>
      <p>Voulez vous vraiment supprimer cet event ?</p>
    </div>
    <div id="action-delete">
      <button type="submit" id="confirm-delete" on:click={confirmDeleteEvent}
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
      <select bind:value={typePrise} required id="type-prise">
        <option value="" style="color:grey" disabled selected hidden
          >{oldType}</option
        >

        <option style="color : black" value="Européenne">Européenne</option>
        <option style="color : black" value="Prise camping-car"
          >Prise camping-car</option
        >
      </select>
    </div>
    <div id="form'action">
      <button
        type="submit"
        class="confirm-btn"
        style="color:black"
        on:click={confirmModify}>Modifier</button
      >
      <button
        type="submit"
       class="cancel-btn"
        style="background-color: var(--red-error); width: 100%;"
        on:click={closePopup}>Annuler</button
      >
    </div>
  </div>
{/if}

{#if showModalModifyInfoEvent}
  <div id="container-create-event">
    <i class="fa-solid fa-xmark" on:click={closePopup} />
    <div id="champ-text-add-point">
      <input
        autocomplete="off"
        placeholder="Nom"
        type="text"
        name="nameEvent"
        id="nameEventInput"
        required
        bind:value={nameEventInput}
      />
      <input
        autocomplete="off"
        placeholder="Description (optionnel)"
        type="text"
        name="descriptionEvent"
        id="descriptionEventInput"
        bind:value={descriptionEventInput}
      />
      <label>
        Animation :
        <input type="checkbox" bind:checked={hasAnimation} />
        {#if hasAnimation}
          <div class="animation-dropdown">
            <input
              type="number"
              placeholder="Frais de participation"
              bind:value={participationFee}
            />
            <textarea
              placeholder="Description de l'événement"
              rows="4"
              bind:value={animationDescription}
            />
          </div>
        {/if}
      </label>
      <input
        autocomplete="off"
        placeholder="Distance (en Km)"
        type="number"
        name="distanceEvent"
        id="distanceEventInput"
        min="0"
        bind:value={distanceEventInput}
      />
      {#if !isStartDateInput}
        <input
          autocomplete="off"
          placeholder="Date début"
          type="text"
          name="startDateEvent"
          id="startDateEventInput"
          bind:value={startDateEventInput}
          on:click={toggleStartDateInput}
        />
      {:else}
        <input
          autocomplete="off"
          type="date"
          name="startDateEvent"
          id="startDateEventInput"
          bind:value={startDateEventInput}
          on:blur={() => {
            isStartDateInput = false;
            if (!isDateValid(startDateEventInput)) {
              startDateEventInput = "";
              alert("La date doit être supérieure à la date du jour");
            }
          }}
        />
      {/if}

      {#if !isEndDateInput}
        <input
          autocomplete="off"
          placeholder="Date fin"
          type="text"
          name="endDateEvent"
          id="endDateEventInput"
          bind:value={endDateEventInput}
          on:click={toggleEndDateInput}
        />
      {:else}
        <input
          autocomplete="off"
          type="date"
          name="endDateEvent"
          id="endDateEventInput"
          bind:value={endDateEventInput}
          on:blur={() => {
            isEndDateInput = false;
            if (!isDateValid(endDateEventInput)) {
              endDateEventInput = "";
              alert("La date doit être supérieure à la date du jour");
            } else if (
              new Date(endDateEventInput) < new Date(startDateEventInput)
            ) {
              endDateEventInput = "";
              alert(
                "La date de fin doit être supérieure ou égale à la date de début"
              );
            }
          }}
        />
      {/if}

      {#if !isStartHourInput}
        <input
          autocomplete="off"
          placeholder="Heure du départ (hh:mm)"
          type="text"
          name="startHourEvent"
          id="startHourEventInput"
          bind:value={startHourEventInput}
          on:click={toggleStartHourInput}
        />
      {:else}
        <input
          autocomplete="off"
          type="time"
          name="startHourEvent"
          id="startHourEventInput"
          bind:value={startHourEventInput}
          on:blur={() => (isStartHourInput = false)}
        />
      {/if}
      <div id="iframe-line">
        <input
          autocomplete="off"
          placeholder="iframe itinéraire (optionnel)"
          type="text"
          name="iframeEvent"
          id="iframeEventInput"
          bind:value={iframeEventInput}
        />
        <p id="help-iframe" on:click={helpIframe}>(?)</p>
      </div>
      <textarea
        placeholder="Informations (optionnel)"
        id="more-info-event"
        name="story"
        rows="5"
        cols="33"
        bind:value={informationsEventInput}
      />
    </div>
    <div id="form'action">
      <button
        type="submit"
        class="confirm-btn"
        style="color:black"
        on:click={modifyEvent}>Modifier</button
      >
      <button
        type="submit"
       class="cancel-btn"
        on:click={closePopup}>Annuler</button
      >
    </div>
  </div>
  <!-- <div id="form'action">
      <button
        type="submit"
        id="add-point-btn"
        style="color:black"
        on:click={createEvent}>Créer l'évenement</button
      >
    </div> -->
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
      <select bind:value={typePrise} required id="type-prise">
        <option value="" style="color:grey" disabled selected hidden
          >Type de prise</option
        >
        <option style="color : black" value="Européenne">Européenne</option>
        <option style="color : black" value="Prise camping-car"
          >Prise camping-car</option
        >
      </select>
    </div>
    <div id="form'action">
      <button
        type="submit"
        class="confirm-btn"
        style="color:black"
        on:click={submitInfoPoint}>Ajouter</button
      >
    </div>
  </div>
{/if}

{#if showModalCreateEvent}
  <div id="container-create-event">
    <i class="fa-solid fa-xmark" on:click={closePopup} />
    <div id="champ-text-add-point">
      <input
        autocomplete="off"
        placeholder="Nom"
        type="text"
        name="nameEvent"
        id="nameEventInput"
        required
        bind:value={nameEventInput}
      />
      <input
        autocomplete="off"
        placeholder="Description (optionnel)"
        type="text"
        name="descriptionEvent"
        id="descriptionEventInput"
        bind:value={descriptionEventInput}
      />
      <label>
        Animation :
        <input type="checkbox" bind:checked={hasAnimation} />
        {#if hasAnimation}
          <div class="animation-dropdown">
            <input
              type="number"
              placeholder="Frais de participation"
              bind:value={participationFee}
            />
            <textarea
              placeholder="Description de l'événement"
              rows="4"
              bind:value={animationDescription}
            />
          </div>
        {/if}
      </label>
      <input
        autocomplete="off"
        placeholder="Distance (en Km)"
        type="number"
        name="distanceEvent"
        id="distanceEventInput"
        min="0"
        bind:value={distanceEventInput}
      />
      {#if !isStartDateInput}
        <input
          autocomplete="off"
          placeholder="Date début"
          type="text"
          name="startDateEvent"
          id="startDateEventInput"
          bind:value={startDateEventInput}
          on:click={toggleStartDateInput}
        />
      {:else}
        <input
          autocomplete="off"
          type="date"
          name="startDateEvent"
          id="startDateEventInput"
          bind:value={startDateEventInput}
          on:blur={() => {
            isStartDateInput = false;
            if (!isDateValid(startDateEventInput)) {
              startDateEventInput = "";
              alert("La date doit être supérieure à la date du jour");
            }
          }}
        />
      {/if}

      {#if !isEndDateInput}
        <input
          autocomplete="off"
          placeholder="Date fin"
          type="text"
          name="endDateEvent"
          id="endDateEventInput"
          bind:value={endDateEventInput}
          on:click={toggleEndDateInput}
        />
      {:else}
        <input
          autocomplete="off"
          type="date"
          name="endDateEvent"
          id="endDateEventInput"
          bind:value={endDateEventInput}
          on:blur={() => {
            isEndDateInput = false;
            if (!isDateValid(endDateEventInput)) {
              endDateEventInput = "";
              alert("La date doit être supérieure à la date du jour");
            } else if (
              new Date(endDateEventInput) < new Date(startDateEventInput)
            ) {
              endDateEventInput = "";
              alert(
                "La date de fin doit être supérieure ou égale à la date de début"
              );
            }
          }}
        />
      {/if}

      {#if !isStartHourInput}
        <input
          autocomplete="off"
          placeholder="Heure du départ (hh:mm)"
          type="text"
          name="startHourEvent"
          id="startHourEventInput"
          bind:value={startHourEventInput}
          on:click={toggleStartHourInput}
        />
      {:else}
        <input
          autocomplete="off"
          type="time"
          name="startHourEvent"
          id="startHourEventInput"
          bind:value={startHourEventInput}
          on:blur={() => (isStartHourInput = false)}
        />
      {/if}
      <div id="iframe-line">
        <input
          autocomplete="off"
          placeholder="iframe itinéraire (optionnel)"
          type="text"
          name="iframeEvent"
          id="iframeEventInput"
          bind:value={iframeEventInput}
        />
        <p id="help-iframe" on:click={helpIframe}>(?)</p>
      </div>
      <textarea
        placeholder="Informations (optionnel)"
        id="more-info-event"
        name="story"
        rows="5"
        cols="33"
        bind:value={informationsEventInput}
      />
    </div>
    <div id="form'action">
      <button
        type="submit"
        id="add-point-btn"
        style="color:black"
        on:click={createEvent}>Créer l'évenement</button
      >
    </div>
  </div>
{/if}


{#if showModalAskAction}
  <div id="container-add-info-point">
    <i class="fa-solid fa-xmark" on:click={closePopup} />

    <p>Que souhaitez vous faire ?</p>
    <div id="form'action">
      <button
        type="submit"
        class="confirm-btn"
        style="color:black"
        on:click={addPoint}>Ajouter un point de charge</button
      >
      <button
        type="submit"
        class="confirm-btn"
        style="color:black"
        on:click={addEvent}>Créer un événement</button
      >
    </div>
  </div>
{/if}

{#if isLogged}
  <section id="map-section-logged">
    <div id="map" />
  </section>
{:else}
  <section id="map-section">
    <div id="map" />
  </section>
{/if}

<style>
  /* voir fichier dans public/css/app.css */
</style>