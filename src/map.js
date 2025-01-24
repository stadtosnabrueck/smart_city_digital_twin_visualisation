import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { Rive, EventType, RiveEventType, RiveFile } from "@rive-app/canvas";
import "./html-overlay";
import {
  adjustLatLng,
  buildPopupContent,
  createCanvasElement,
  createFPSCounter,
  getMapFilePath,
  handleScalingObject,
  isMobile,
  replaceSVGColors_unsafe,
  updateRiveColorInputs,
} from "./utils";
import {
  ANIMATIONS,
  IMG_HEIGHT,
  IMG_WIDTH,
  BUTTON_HTML,
  MAP_CONFIG,
  ANIMATION_FILES,
  BASE_COLORS,
  NEW_COLORS,
} from "./constants";

export const addMap = async (element) => {

  const data = await fetch("/data/markers.json");
  const markersData = await data.json();

  const map = Leaflet.map(element, MAP_CONFIG);

  const group = Leaflet.control({
    position: "bottomright",
  });
  group.onAdd = () => {
    const cont = Leaflet.DomUtil.create("div", "button-container");
    cont.innerHTML = BUTTON_HTML;
    return cont;
  };
  group.addTo(map);
  Leaflet.control.zoom({ position: "bottomright" }).addTo(map);

  const basePane = map.createPane("basePane");
  basePane.style.zIndex = 0;


  const bounds = Leaflet.latLngBounds([
    [0, 0],
    [IMG_HEIGHT, IMG_WIDTH],
  ]);


  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("showFPS")) {

    const fpsControl = Leaflet.control({ position: "topright" });
    fpsControl.onAdd = () => createFPSCounter();
    fpsControl.addTo(map);
  }


  const mapFilePath = getMapFilePath(urlParams.get("format"));


  const newColors = await NEW_COLORS;

  const colorReplacements = [
    { from: BASE_COLORS.primary, to: newColors.primary },
    { from: BASE_COLORS.secondary, to: newColors.secondary },
    { from: BASE_COLORS.highlight, to: newColors.highlight },
    { from: BASE_COLORS.nature, to: newColors.nature },
  ];


  function loadSVG(filePath) {
    return fetch(filePath)
      .then((response) => response.text())
      .catch((error) => {
        console.error("Error loading the SVG:", error);
        throw error;
      });
  }

  try {
    const svgText = await loadSVG(mapFilePath);
    const modifiedSVGString = await replaceSVGColors_unsafe(svgText, colorReplacements);
    const blob = new Blob([modifiedSVGString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    L.imageOverlay(url, bounds, { pane: basePane }).addTo(map);
  } catch (error) {
    console.error("Error processing the SVG:", error);
  }


  map.fitBounds(bounds);



  const locations = markersData.map((location) => ({
    ...location,
    latLng: adjustLatLng(location.latLng),
  }));


  const preloadedPinAnimationRiveFile = new RiveFile({
    src: ANIMATION_FILES["sensor-icon"]
  });
  await preloadedPinAnimationRiveFile.init().catch((error) => {
    console.error("Error loading Rive file:", error);
  });

  locations.forEach((location, index) => {
    addRiveMapPin(
      map,
      location.latLng,
      preloadedPinAnimationRiveFile,
      location.headline,
      location.body,
      location.iconSelector,
      location.shadowOn,
      index
    );
  });


  ANIMATIONS.forEach((animation, index) => {
    addRiveAnimation(
      map,
      animation.latLng,
      animation.riveFilePath,
      animation.canvasWidth,
      animation.canvasHeight,
      index
    );
  });


  map.on("zoom", () => {
    adjustRiveCanvases(map);
  });


  const toggleButton = document.getElementById("toggleMarkers");
  const checkboxToggle = document.getElementById("toggle");
  let markersVisible = true;

  const clickHandler = () => {
    const markerPane = map.getPanes().markerPane;

    if (markersVisible) {
      markerPane.classList.add("fade-out");
      markerPane.classList.remove("fade-in");
      checkboxToggle.checked = false;
      if (toggleButton.classList.contains("toggler-marker-active")) {
        toggleButton.classList.remove("toggler-marker-active");
        toggleButton.classList.add("toggler-marker-inactive");
      }
      markerPane.style.display = "none";
    } else {
      markerPane.classList.add("fade-in");
      markerPane.classList.remove("fade-out");
      checkboxToggle.checked = true;
      if (toggleButton.classList.contains("toggler-marker-inactive")) {
        toggleButton.classList.remove("toggler-marker-inactive");
        toggleButton.classList.add("toggler-marker-active");
      }
      markerPane.style.display = "block";
    }

    markersVisible = !markersVisible;
  };

  toggleButton.addEventListener("click", clickHandler);
  checkboxToggle.addEventListener("click", clickHandler);

  if (isMobile()) {
    map.setMinZoom(-1);
    map.setZoom(-1);
  }
};


const adjustRiveCanvases = (map) => {
  document.querySelectorAll(".rive-animation").forEach((canvas) => {
    handleScalingObject(map, canvas);
  });
};






const addRiveMapPin = (
  map,
  latLng,
  preloadedFile,
  headline,
  body,
  iconSelector,
  shadowOn = true,
  index
) => {

  const riveCanvas = createCanvasElement(
    160,
    185,
    "rive-pin",
    `rive-pin-${index}`
  );


  const icon = Leaflet.divIcon({
    className: "custom-rive-icon",
    iconSize: [160, 185],
    iconAnchor: [80, 180],
    popupAnchor: [0, -180],
  });


  const marker = Leaflet.marker(latLng, {
    icon: icon,
    interactive: true,
  }).addTo(map);


  const popupContent = buildPopupContent(headline, body);

  marker.bindPopup(popupContent);

  let activeInput = null;
  let isAnimating = false;
  let isPopupOpen = false;
  let riveInstance = null;

  const r = new Rive({
    riveFile: preloadedFile,
    canvas: riveCanvas,
    autoplay: true,
    stateMachines: ["State Machine 1"],
    onLoad: async () => {
      r.resizeDrawingSurfaceToCanvas();


      riveInstance = r;

      const resolvedColors = await NEW_COLORS;


      const stateMachineInputs = r.stateMachineInputs("State Machine 1");
      if (stateMachineInputs) {
        activeInput = stateMachineInputs.find(
          (input) => input.name === "active"
        );
        const iconSelectorInput = stateMachineInputs.find(
          (input) => input.name === "iconSelector"
        );
        const shadowOnInput = stateMachineInputs.find(
          (input) => input.name === "shadowOn"
        );


        updateRiveColorInputs(
          BASE_COLORS,
          resolvedColors,
          stateMachineInputs
        );

        if (iconSelectorInput) {
          iconSelectorInput.value = iconSelector;
        }

        if (shadowOnInput) {
          shadowOnInput.value = shadowOn;
        }


        if (marker.getPopup().isOpen() && activeInput) {
          activeInput.value = true;
          isPopupOpen = true;
        }
      }
    },
  });

  const onRiveEventReceived = (riveEvent) => {
    const eventData = riveEvent.data;
    if (eventData.type === RiveEventType.General) {
      if (eventData.name === "hover") {

        riveCanvas.style.cursor = "pointer";
      } else if (eventData.name === "unhover") {

        riveCanvas.style.cursor = "grab";
      } else if (eventData.name === "clickMarker") {
        if (!isAnimating && !isPopupOpen && activeInput) {
          activeInput.value = true;
          marker.openPopup();
          isAnimating = true;
          isPopupOpen = true;
        }
      }
    } else if (eventData.type === RiveEventType.OpenUrl) {
      window.open(eventData.url);
    }
  };


  r.on(EventType.RiveEvent, onRiveEventReceived);


  marker.on("popupclose", () => {
    setTimeout(() => {
      if (activeInput) {
        activeInput.value = false;
      }
      isAnimating = false;
      isPopupOpen = false;
    }, 100);
  });


  marker.getElement().appendChild(riveCanvas);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!riveInstance) return;
        if (entry.isIntersecting) {
          riveInstance.play();
        } else {
          riveInstance.pause();
        }
      });
    },
    {
      root: document.querySelector("#map"),
      threshold: 0.1,
    }
  );

  observer.observe(document.querySelector(`#rive-pin-${index}`));
};

const addRiveAnimation = (
  map,
  latLng,
  riveFilePath,
  canvasWidth,
  canvasHeight,
  index
) => {

  const canvasEl = createCanvasElement(
    canvasWidth,
    canvasHeight,
    "rive-animation",
    `rive-animation-${index}`
  );
  let riveInstance = null;


  const riveHtml = canvasEl.outerHTML;


  const riveOverlay = Leaflet.htmlOverlay(riveHtml, latLng, {
    className: "rive-overlay",
    zoom: map.getZoom(),
    zIndex: 1000,
  });


  riveOverlay.addTo(map);

  const canvasAddedToDOM = document.querySelector(`#rive-animation-${index}`);


  const r = new Rive({
    src: riveFilePath,
    canvas: canvasAddedToDOM,
    autoplay: true,
    stateMachines: ["State Machine 1"],
    onLoad: async () => {
      r.resizeDrawingSurfaceToCanvas();

      riveInstance = r;

      const resolvedColors = await NEW_COLORS;


      const stateMachineInputs = r.stateMachineInputs("State Machine 1");
      updateRiveColorInputs(BASE_COLORS, resolvedColors, stateMachineInputs);
    },
    onError: (error) => {
      console.error("Error loading Rive animation:", error);
    },
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!riveInstance) return;
        if (entry.isIntersecting) {
          riveInstance.play();
        } else {
          riveInstance.pause();
        }
      });
    },
    {
      root: document.querySelector("#map"),
      threshold: 0.1,
    }
  );

  observer.observe(document.querySelector(`#rive-animation-${index}`));


  map.on("zoomend", () => {
    riveOverlay._reset();
    handleScalingObject(map, canvasAddedToDOM);
    if (riveInstance) {
      riveInstance.resizeDrawingSurfaceToCanvas();
    }
  });

  map.on("moveend", () => {
    riveOverlay._reset();
  });
};
