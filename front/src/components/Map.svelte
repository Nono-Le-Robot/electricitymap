<script>
  import { onMount } from "svelte";
  import L from "leaflet";
  import "leaflet-routing-machine";
  import "leaflet-control-geocoder";
  import "lrm-graphhopper";
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
  let commentReport = "";
  let namePointInput = "";
  let nameEventInput = "";
  let descriptionPointInput = "";
  let descriptionEventInput = "";
  let informationsEventInput;
  let distanceEventInput = "";
  let startDateEventInput = "";
  let endDateEventInput = "";
  let startHourEventInput = "";
  let iframeEventInput = "";
  let newUsernameInput = "";
  let lockView = true;
  let latPointToAdd;
  let lngPointToAdd;
  let showIconPanel = true;
  let showModalAskAction = false;
  let showModalAddPoint = false;
  let showModalModifyInfo = false;
  let showConfirmDelete = false;
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

     

        function isPointCreator(email, username,userId,userToken) {
           
          if (email === point.email && username === point.addedBy) {
            return `
        <i class="fa-solid fa-pen" style="cursor:pointer; font-size:20px"></i>
        <i class="fa-solid fa-trash-can" style="cursor:pointer; color:red; font-size:20px;"></i>
            `;
          } else {
            // return ` <i class="fa-solid fa-triangle-exclamation" style="cursor:pointer; font-size:20px; color:red"></i>`;
            return ``
          }
        }
        
        function isPointUserReport(email, username,userId,userToken,pointCreatedBy,pointAddedBy,pointId) {
          if (email !== point.email && username !== point.addedBy) {
            return `
        <i class="fa-solid fa-flag" id="reportPoint" style="cursor:pointer; font-size:20px; color:red"></i>
            `;
          } else {
            return ``;
          }
        }  
 
function switchLikePoint(user, like) {
if(point.likers !== undefined){
  if (point.likers.includes(user)) {
    return `
      <div style="display: flex; align-items: flex-start;">
       <i class="fa-solid fa-heart" id="dislikeIcone" style="cursor:pointer; font-size:15px; color:pink"></i>
   
      </div>
    `;
  } else{
    return `
      <div style="display: flex; align-items: flex-start;">
            <i class="fa-regular fa-heart" id="likeIcone" style="cursor:pointer; font-size:15px; color:pink"></i>
      </div>
    `;
  }
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
  } else if (point.lovers.includes(user) || point.haters === undefined) {
    return `
      <i class="fa-solid fa-thumbs-up" id="unapprouveIcone" style="cursor:pointer; font-size:15px; color:green"></i>
    `;
  } else if (point.haters.includes(user) || point.lovers === undefined) {
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
        ${switchLikePoint(userId, point.likers)}
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
         ${ switchLikeUser(userId, point.lovers, point.haters)}
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
        ${isPointCreator(userMail, userPseudo,userId,userToken)}
        ${isPointUserReport(userMail, userPseudo,userId,userToken,point.createdBy,point.addedBy,point._id)}
         </div>
       `);
        function getImageSource(priseType) {
          switch (priseType) {
            case "Européenne":
            // typePrise = "Européenne"
            oldType = "Européenne"
              return "eu-flag.png";
            case "Prise camping-car":
            // typePrise = "Prise camping-car"
            oldType = "Prise camping-car"
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

          // const reportIcon = document.querySelector(".fa-triangle-exclamation");
          // reportIcon?.addEventListener("click", async () => {
          //   // alert("report");
          // });
     
            const likeIcon = document.getElementById("likeIcone")
          if (likeIcon) {
          likeIcon.addEventListener("click", async () => {  
           await axios.post(`${apiUrl}/api/data/like-point`, {
              token : userToken,
              idUser:  userId,
              idPoint: selectedMarker,
                      
              }).then((data) => {
               refreshPoints();
              console.log(data)
              })
          })}
          

      
  const dislikeIcone = document.getElementById("dislikeIcone");
  if (dislikeIcone) {
    dislikeIcone.addEventListener("click", async () => { 
      await axios.post(`${apiUrl}/api/data/dislike-point`, {
        token: userToken, 
        idUser: userId,
        idPoint: selectedMarker,
      }).then((data) => {
           refreshPoints();
        console.log(data);
      });
    });
  }

       
          const approuveIcone = document.getElementById("approuveIcone")
          if (approuveIcone){
          approuveIcone.addEventListener("click", async () => {  
          await axios.post(`${apiUrl}/api/auth/likeUser`, {
              token : userToken,
              idUser:  userId,
              idPoint: selectedMarker,      
              }).then((data) => {
                  refreshPoints();
              console.log(data)
              })
          })}
          
           const unapprouveIcone = document.getElementById("unapprouveIcone")
          if (unapprouveIcone) {
          unapprouveIcone.addEventListener("click", async () => {  
          await axios.post(`${apiUrl}/api/auth/unlikeUser`, {
              token : userToken,
              idUser:  userId,
              idPoint: selectedMarker,        
              }).then((data) => {
                  refreshPoints();
              console.log(data)
              })
          })
      }
          
          const desapprouveIcone = document.getElementById("desapprouveIcone")
          if (desapprouveIcone) {
          desapprouveIcone.addEventListener("click", async () => {  
          await axios.post(`${apiUrl}/api/auth/dislikeUser`, {
              token : userToken,
              idUser:  userId,
              idPoint: selectedMarker,        
              }).then((data) => {
                 refreshPoints();
              console.log(data)
              })
          })
      }
      
        const undesapprouveIcone = document.getElementById("undesapprouveIcone")
          if (undesapprouveIcone) {
          undesapprouveIcone.addEventListener("click", async () => {  
          await axios.post(`${apiUrl}/api/auth/undislikeUser`, {
              token : userToken,
              idUser:  userId,
              idPoint: selectedMarker,        
              }).then((data) => {
                refreshPoints();
              console.log(data)
              })
          })
      }
       
          const eyeIcon = document.getElementById("see-point");
          eyeIcon?.addEventListener("click", () => {
            if (point.eventName) {
              ({
                eventName: selectedEventName,
                eventDescription: selectedEventDescription,
                eventInformations: selectedEventInformations,
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
          });

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
            showModalReportPointFirstStep = true
          });
          
       });
    });
    }
    createMarkerAndBindEvents(groupMarkersEvents, markersLayerEvents);
    createMarkerAndBindEvents(groupMarkersEuropeene, markersLayerEuropeene);
    createMarkerAndBindEvents(groupMarkersAmericaine, markersLayerAmericaine);
    createMarkerAndBindEvents(groupMarkersCampingCar, markersLayerCampingCar);
  };
  
  const reportPointConfirm = async () =>{
              const commentTextarea = document.getElementById("commentReport");
              commentReport = commentTextarea.value
              await axios.post(`${apiUrl}/api/report/reportPoint`, {
              idPoint: selectedMarker,
              idUser: userId,
              comment : commentReport,
              
              }).then((res,err)=>{
              if (res){
              showModalReportPointTwoStep= !showModalReportPointTwoStep
              commentReport = ""
              showModalReportPointConfirm = true
              closePopUpTimer()
              }
              })
              .catch((err) => {
               closePopup()
              showModalReportPointError = true
               closePopUpTimerError()
                console.log(err);
              });    
    }
 
    
  const closePopup = () => {
    map.closePopup();
    showModalAddPoint = false;
    showModalAskAction = false;
    showModalModifyInfo = false;
    showConfirmDelete = false;
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
  };

  const closePopUpTimer = () =>{
  setTimeout(()=>{
  closePopup()
  },2000)
  }

  const closePopUpTimerError = () =>{
  setTimeout(()=>{
  closePopup()
  },4000)
  }



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
    var iframeString = iframeEventInput;
    var srcRegex = /src="([^"]+)"/;
    var matches = iframeString.match(srcRegex);
    if (matches && matches.length > 1) {
      var iframeLink = matches[1];
    } else {
      console.log("Aucune correspondance trouvée pour l'attribut 'src'");
    }
    
    // function isValidDate(date) {
    //    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    // return new Date(date).toLocaleDateString(undefined, options);
  
    // }
    // function isValidTime(time) {
    //   const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    //   if (!timePattern.test(time)) {
    //     return "Le format de l'heure doit être HH:mm (24 heures)";
    //   }
    //   return null;
    // }
    // function isAfterCurrentDate(date) {
    //   const currentDate = new Date();
    //   const parts = date.split("/");
    //   const day = parseInt(parts[0], 10);
    //   const month = parseInt(parts[1], 10) - 1;
    //   const year = parseInt(parts[2], 10);
    //   const newDate = new Date(year, month, day);
    //   return newDate > currentDate;
    // }
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

    // const iframeString = iframeEventInput;
    // const srcRegex = /src="([^"]+)"/;
    // const matches = iframeString.match(srcRegex);
    // let iframeLink = "";

    if (matches && matches.length > 1) {
      iframeLink = matches[1];
    } else {
      console.log("Aucune correspondance trouvée pour l'attribut 'src'");
    }

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
      } else if (!isTimeAfterCurrentTime(startHourEventInput)) {
        alert("L'heure de début doit être postérieure à l'heure actuelle");
        showIconPanel = false;
        showModalCreateEvent = true;
      } else {
        const res = await axios.post(`${apiUrl}/api/data/create-event`, {
          token : userToken,
          idUser : userId,
          createdBy: userPseudo ,
          email: userMail,
          eventName: nameEventInput,
          eventDescription: descriptionEventInput,
          eventInformations: informationsEventInput,
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
        }).then((res)=>{
        if (res){
        alert("Événement créé avec succès");
        nameEventInput = "";
        descriptionEventInput = "";
        distanceEventInput = "";
        startDateEventInput = "";
        endDateEventInput = "";
        startHourEventInput = "";
        iframeEventInput = "";
        informationsEventInput = "";
        refreshPoints();
        closePopup();
        }
     })
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
    distance,
    iframe,
    coords,
    startDate,
    endDate,
    startHour
  ) => {
    selectedEventName = eventName;
    selectedEventDescription = eventDescription;
    selectedEventInformations = eventInformations;
    selectedEventCreatedBy = createdBy;
    selectedEventEmail = email;
    selectedEventDistance = distance;
    selectedEventIframe = iframe;
    selectedEventCoords = coords;
    selectedEventStartDate = startDate;
    selectedEventEndDate = endDate;
    selectedEventStartHour = startHour;
    showModalEvents = false;
    showModalEventDetails = true;
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
    await axios.post(`${apiUrl}/api/data/add-point`, {
      token: userToken,
      idUser: userId ,
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
    }).then(() => {
    namePointInput = "";
    descriptionPointInput = ""
    typePrise = "";
    // oldType = "";
    refreshPoints();
    closePopup();
    enableToPlace = false;
    }).catch((err) => {
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
      // oldType = ""
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
    const inputDateObj = new Date(inputDate)
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
        : markersLayerEvents.removeFrom(map)

    }
  });
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
    {#if selectedEventIframe && selectedEventIframe.includes("https://www.google.com/maps/")}
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
      <button type="submit" id="confirm-delete" on:click={() => { closePopup(), showModalReportPointTwoStep = true}}
        >Oui</button
      >
      <button type="submit" id="cancel-delete" on:click={closePopup}>Non</button
      >
    </div>
    <div />
  </div>
{/if}

{#if showModalReportPointTwoStep}
  <div id="container-remove-point">
    <div>
      <p>Quel est la raison ? </p>
    </div>
    <div>
    <textarea id="commentReport" maxlength="200" >
    </textarea>
    </div>
    
    <div id="action-delete">
      <button type="submit" id="confirm-delete" on:click={reportPointConfirm}
        >Confirmer</button
      >
      <button type="submit" id="cancel-delete" on:click={closePopup}>Annuler</button
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
          src="./assets/photo.jpg"
          alt=""
          srcset=""
        />
      </div>
    </div>
    <div id="action-settings">
      <div class="btn-settings">Social</div>
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
      {#each allEvents as { createdBy, email, eventName, eventInformations, eventDescription, distance, iframe, coords, startDate, endDate, startHour }, i}
        <div
          on:click={showEventDetails(
            createdBy,
            email,
            eventName,
            eventDescription,
            eventInformations,
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
      <img
        id="profil-picture-account-settings"
        src="./assets/photo.jpg"
        alt=""
        srcset=""
      />
      <i class="fa-solid fa-pen" id="modify-image-settings" />


      <br />
      <div id="pseudo-account-settings">
        <h2>NonoLeRobot</h2>
        <i class="fa-solid fa-pen" id="modify-pseudo-settings" />
      </div>
    </div>
    <div id="action-account-settings">
      <div class="sub-action-account-settings">
        <h3 style="margin:5px 0">Localisation</h3>
        <p style="margin:0">Partager ma position : - slider</p>
        <p style="margin:0">Gérer ma visibilité</p>
      </div>

      <div class="sub-action-account-settings">
        <h3 style="margin:5px 0">Evenements</h3>
        <p style="margin:0">A venir</p>
        <p style="margin:0">Voir tout les événements</p>
      </div>

      <div class="sub-action-account-settings">
        <h3 style="margin:5px 0">Aide</h3>
        <p style="margin:0">Contacter le support</p>
        <p style="margin:0">boite à idées</p>
      </div>
    </div>
    <div id="footer-account-settings" />
    <p style="color:red ; margin:0; cursor:pointer;">Supprimer mon compte</p>

    </div>
    <i class="fa-solid fa-xmark" on:click={closePopup} />

    <div id="pseudo-account-settings">
      <h2>{userPseudo}</h2>
      <i
        class="fa-solid fa-pen"
        id="modify-pseudo-settings"
        on:click={askNewUsername}
      />
    </div>
    <div id="action-account-settings">
      <p style="margin:0 cursor:pointer" on:click={contactSupport}>
        Contacter le support
      </p>
      <p style="cursor:pointer" on:click={logout}>Déconnexion</p>

      <p
        style="color:red ; margin:0; cursor:pointer;"
        on:click={confirmDeleteAccount}
      >
        Supprimer mon compte
      </p>
    </div>
  <!-- </div> -->
{/if}

{#if showModalConfirmDeleteAccount}
  <div id="container-remove-point">
    <div>
      <p>Voulez vous vraiment supprimer votre compte ?</p>
      <p style="color:red">Cette action est irréversible.</p>
    </div>
    <div id="action-delete">
      <button type="submit" id="confirm-delete">Oui</button>
      <button type="submit" id="cancel-delete" on:click={closePopup}>Non</button
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
        <option
          value=""
          style="color:grey"
          disabled
          selected
          hidden>{oldType}</option
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
        id="add-point-btn"
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
        startDateEventInput = '';
        alert('La date doit être supérieure à la date du jour');
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
        endDateEventInput = '';
        alert('La date doit être supérieure à la date du jour');
      } else if (new Date(endDateEventInput) < new Date(startDateEventInput)) {
        endDateEventInput = '';
        alert('La date de fin doit être supérieure ou égale à la date de début');
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
        id="add-point-btn"
        style="color:black"
        on:click={addPoint}>Ajouter un point de charge</button
      >
      <button
        type="submit"
        id="add-point-btn"
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
  #container-account-settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    width: 90vw;
    height: 95vh;
    overflow-y: visible;
    position: absolute;
    top: 50vh;
    left: 50vw;
    z-index: 9999;
    color: white;
    border-radius: 0.5rem;

    transform: translate(-50%, -50%);
    background-color: var(--dark-blue-color);
  }
  #profil-picture-account-settings {
    margin-top: 25px;
    height: 20vh;
    width: 20vh;
    background-color: rgba(21, 20, 37, 0.849);
    border-radius: 50%;
    object-fit: cover;
    filter: grayscale(80%);
  }
  #header-account-settings {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: column;
  }
  #pseudo-account-settings {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  #action-account-settings {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
  }
  .sub-action-account-settings {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0.5rem;
  }
  #modify-pseudo-settings {
    padding: 0.5rem;
    background-color: var(--main-color);
    border-radius: 0.5rem;
    box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.068);
    color: black;
    cursor: pointer;
  }
  #modify-image-settings {
    padding: 1rem;
    background-color: rgba(181, 198, 255, 0.7);
    border-radius: 100%;
    box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.068);
    color: black;
    cursor: pointer;
    position: relative;
    top: -50%;
    left: 0;
    transform: translateY(25%);
    font-size: 1rem;
  }
  #help-iframe {
    right: 1rem;
    cursor: pointer;
    transform: translateY(5px);
    margin-left: 10px;
  }
  #profil-picture-settings {
    margin-top: 2rem;
    height: 25vh;
    width: 25vh;
    background-color: rgba(21, 20, 37, 0.849);
    border-radius: 50%;
    object-fit: cover;
  }

  #iframe-line {
    transform: translateX(17px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #route-viewer {
    width: 95%;
    height: 40vh;
    border-radius: 0.5rem;
  }
  #container-event-details {
    padding: 1rem;
    background-color: var(--dark-blue-color);
    width: 90vw;
    height: 95vh;
    position: absolute;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
    z-index: 99999;
    border-radius: 0.5rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: space-evenly;
    flex-direction: column;
  }
  #container-event-details p {
    margin: 0;
  }
  #container-place-point {
    position: absolute;
    background-color: var(--dark-blue-color);
    top: 50vh;
    left: 50vw;
    z-index: 99999;
    transform: translate(-50%, -50%);
    padding: 3rem;
    color: white;
    border-radius: 0.5rem;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  #type-prise,
  #descriptionPointInput,
  #namePointInput,
  #more-info-event,
  #type-prise {
    width: 200px;
    margin-left: auto;
    margin-right: auto;
  }

  #container-settings {
    background-color: var(--dark-blue-color);
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: column;
    width: 90vw;
    height: 90vh;
    position: absolute;
    z-index: 9999;
    left: 50vw;
    top: 50vh;
    transform: translate(-50%, -50%);
    border-radius: 0.5rem;
  }

  #header-settings {
    display: flex;
    gap: 2vh;
    flex-direction: column;
    width: 100%;
    height: 40vh;
    border-radius: 0.5rem;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  #action-settings {
    width: 90%;
    height: 10vh;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .btn-settings {
    background-color: var(--dark-blue-color);
    width: 50%;
    box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.068);
    padding: 1rem;
    border-radius: 0.5rem;

    text-align: center;
    cursor: pointer;
    background-color: white;
  }

  #footer-settings {
    margin-top: 1rem;
    margin-bottom: 1rem;
    width: 99.5%;
    height: 40vh;
    display: flex;
    align-items: center;
    justify-content: start;
    flex-direction: column;
    border-bottom-right-radius: 1rem;
    border-bottom-left-radius: 1rem;
    overflow-y: scroll;
  }

  #container-events {
    background-color: var(--dark-blue-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    flex-direction: column;
    width: 80vw;
    height: 90vh;
    position: absolute;
    z-index: 9999;
    left: 50vw;
    top: 50vh;
    transform: translate(-50%, -50%);
    border-radius: 0.5rem;

    padding: 2rem;
  }

  #list-events {
    margin-top: 1rem;
    margin-bottom: 1rem;
    width: 99.5%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    border-bottom-right-radius: 1rem;
    border-bottom-left-radius: 1rem;
    overflow-y: scroll;
  }

  .posted-events {
    box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.267);
    text-align: center;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
    background: var(--main-color);
    padding: 1rem;
    border-radius: 0.5rem;

    margin-left: auto;
    margin-right: auto;
    width: 300px;
    height: 300px;

    margin: 0 1rem;
  }

  .posted-point {
    box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.438);
    cursor: pointer;
    margin-top: 1rem;
    background: var(--main-color);
    width: 90%;
    border-radius: 0.5rem;

    height: 400px;
    text-align: center;

    margin-left: auto;
    margin-right: auto;
  }

  .posted-point p {
    margin: 1rem 0;
  }

  #lock-view {
    cursor: pointer;
    width: 40px;
    background-color: var(--dark-blue-color);
    padding: 1rem;
    border-radius: 100%;
    opacity: 0.8;
    position: absolute;
    top: 50vh;
    left: 50vw;
    z-index: 999;
    transform: translateX(-50%) translateY(-50%);
  }

  #start-icon {
    width: 50px;
    background-color: var(--dark-blue-color);
    padding: 1rem;
    border-radius: 100%;
    cursor: pointer;
    position: absolute;
    bottom: 400px;
    z-index: 999;
    right: 180px;
    transform: translateX(-50%);
  }

  #stop-icon {
    width: 50px;
    background-color: var(--dark-blue-color);
    padding: 1rem;
    border-radius: 100%;
    cursor: pointer;
    position: absolute;
    bottom: 400px;
    z-index: 999;
    right: 180px;
    transform: translateX(-50%);
  }

  #icons-interface {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 999;
  }

  #events-icon {
    z-index: 99999;
    position: absolute;
    right: 10px;
    top: 10px;
    width: 30px;
    background-color: var(--dark-blue-color);
    padding: 1rem;
    border-radius: 100%;
    cursor: pointer;
  }

  #settings-icon {
    display: none;
    z-index: 99999;
    position: absolute;
    right: 10px;
    top: 10px;
    width: 30px;
    background-color: var(--dark-blue-color);
    padding: 1rem;
    border-radius: 100%;
    cursor: pointer;
  }

  #plus-icon {
    width: 30px;
    background-color: var(--dark-blue-color);
    padding: 1rem;
    border-radius: 100%;
    cursor: pointer;
  }

  #eye-icon {
    width: 30px;

    background-color: var(--dark-blue-color);
    padding: 1rem;
    border-radius: 100%;
    cursor: pointer;
  }

  #location-icon {
    width: 30px;

    background-color: var(--dark-blue-color);
    padding: 1rem;
    border-radius: 100%;
    cursor: pointer;
  }

  #container-filter {
    padding: 4rem;
    font-size: 20px;
    color: white;
    border-radius: 0.5rem;

    position: absolute;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
    background-color: var(--dark-blue-color);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-evenly;
    z-index: 9999;
  }

  #EU-filter,
  #CC-filter,
  #Event-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 2rem;
    justify-content: space-between;
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
    right: 20px;
    top: 16px;
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
    border-radius: 0.5rem;

    background-color: white;
    color: black;
    padding: 1rem;
    margin-top: 1rem;
    cursor: pointer;
    font-weight: bold;
  }

  input,
  textarea,
  select {
    font-weight: bold;
    font-size: 17px;
    width: 225px;
    border: none;
    border-radius: 0.5rem;

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
    border-radius: 0.5rem;

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
    padding: 3rem;
    position: fixed;
    z-index: 1000;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--dark-blue-color);
    border-radius: 0.5rem;

    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: white;
    width: 240px;
  }

  #container-create-event {
    padding: 3rem;
    position: fixed;
    z-index: 9999999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--dark-blue-color);
    border-radius: 0.5rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: white;
    width: 70vw;
    height: 80vh;
    max-height: 850px;
    max-width: 400px;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  #champ-text-add-point {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }

  #add-point-btn {
    background-color: var(--main-color);
    border: none;
    border-radius: 0.5rem;

    padding: 1rem;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
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

  @media screen and (max-width: 1280px) {
    #start-icon {
      width: 50px;
      background-color: var(--dark-blue-color);
      padding: 1rem;
      border-radius: 100%;
      cursor: pointer;
      position: absolute;
      bottom: 180px;
      z-index: 999;
      left: 50vw;
      transform: translateX(-50%);
    }

    #stop-icon {
      width: 50px;
      background-color: var(--dark-blue-color);
      padding: 1rem;
      border-radius: 100%;
      cursor: pointer;
      position: absolute;
      bottom: 180px;
      z-index: 999;
      left: 50vw;
      transform: translateX(-50%);
    }
  }
</style>
