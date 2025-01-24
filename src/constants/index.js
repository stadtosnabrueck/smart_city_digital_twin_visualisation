import Leaflet from "leaflet";

const BUTTON_HTML = `
  <button id="toggleMarkers" class="toggler-marker-active">
    <svg xmlns="http://www.w3.org/2000/svg" width="24.561" height="16.839" viewBox="0 0 24.561 16.839" class="inactive-svg">
      <g id="Gruppe_2" data-name="Gruppe 2" transform="translate(224.359 -371.58)">
        <circle id="Ellipse_65" data-name="Ellipse 65" cx="3" cy="3" r="3" transform="translate(-215 377)" fill="#c6c6c6"/>
        <g id="Gruppe_3" data-name="Gruppe 3" transform="translate(-406.359 -529)">
          <path id="Pfad_11" data-name="Pfad 11" d="M2.9,1a14.037,14.037,0,0,0,0,14.106" transform="translate(182 900.947)" fill="none" stroke="#c6c6c6" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_12" data-name="Pfad 12" d="M6.453,12.819a9.7,9.7,0,0,1,0-9.751" transform="translate(182.22 901.056)" fill="none" stroke="#c6c6c6" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_13" data-name="Pfad 13" d="M20.62,15.106A14.037,14.037,0,0,0,20.62,1" transform="translate(183.041 900.947)" fill="none" stroke="#c6c6c6" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_14" data-name="Pfad 14" d="M17.038,3.068a9.7,9.7,0,0,1,0,9.751" transform="translate(182.851 901.056)" fill="none" stroke="#c6c6c6" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_15" data-name="Pfad 15" d="M6.453,3.068a9.7,9.7,0,0,0,0,9.751" transform="translate(182.22 901.056)" fill="none" stroke="#c6c6c6" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_16" data-name="Pfad 16" d="M17.038,12.819a9.7,9.7,0,0,0,0-9.751" transform="translate(182.851 901.056)" fill="none" stroke="#c6c6c6" stroke-linecap="round" stroke-width="2"/>
        </g>
      </g>
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="24.561" height="16.839" viewBox="0 0 24.561 16.839" class="active-svg">
      <g id="Gruppe_2" data-name="Gruppe 2" transform="translate(224.359 -371.58)">
        <circle id="Ellipse_65" data-name="Ellipse 65" cx="3" cy="3" r="3" transform="translate(-215 377)" fill="#4a4a4a"/>
        <g id="Gruppe_3" data-name="Gruppe 3" transform="translate(-406.359 -529)">
          <path id="Pfad_11" data-name="Pfad 11" d="M2.9,1a14.037,14.037,0,0,0,0,14.106" transform="translate(182 900.947)" fill="none" stroke="#4a4a4a" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_12" data-name="Pfad 12" d="M6.453,12.819a9.7,9.7,0,0,1,0-9.751" transform="translate(182.22 901.056)" fill="none" stroke="#4a4a4a" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_13" data-name="Pfad 13" d="M20.62,15.106A14.037,14.037,0,0,0,20.62,1" transform="translate(183.041 900.947)" fill="none" stroke="#4a4a4a" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_14" data-name="Pfad 14" d="M17.038,3.068a9.7,9.7,0,0,1,0,9.751" transform="translate(182.851 901.056)" fill="none" stroke="#4a4a4a" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_15" data-name="Pfad 15" d="M6.453,3.068a9.7,9.7,0,0,0,0,9.751" transform="translate(182.22 901.056)" fill="none" stroke="#4a4a4a" stroke-linecap="round" stroke-width="2"/>
          <path id="Pfad_16" data-name="Pfad 16" d="M17.038,12.819a9.7,9.7,0,0,0,0-9.751" transform="translate(182.851 901.056)" fill="none" stroke="#4a4a4a" stroke-linecap="round" stroke-width="2"/>
        </g>
      </g>
    </svg>
    <div class="toggle-switch">
      <input type="checkbox" id="toggle" checked/>
      <label for="toggle" class="toggle-track"></label>
    </div>
  </button>
`;

const IMG_WIDTH = 2459;
const IMG_HEIGHT = 1473;

const ANIMATION_FILES = {
  bus: "rive/bus.riv",
  car: "rive/car.riv",
  impuls: "rive/impuls.riv",
  "rain-sensor": "rive/rain-sensor.riv",
  "sensor-icon": "rive/sensor-icon.riv",
};

const ANIMATIONS = [
  {
    latLng: [794, 599],
    riveFilePath: ANIMATION_FILES.bus,
    canvasWidth: 548,
    canvasHeight: 343,
  },
  {
    latLng: [761, 1469],
    riveFilePath: ANIMATION_FILES.car,
    canvasWidth: 102,
    canvasHeight: 76,
  },
  {
    latLng: [475, 682],
    riveFilePath: ANIMATION_FILES.impuls,
    canvasWidth: 262,
    canvasHeight: 145,
  },
  {
    latLng: [570, 1280],
    riveFilePath: ANIMATION_FILES["rain-sensor"],
    canvasWidth: 187,
    canvasHeight: 135,
  },
];

const MAP_CONFIG = {
  attributionControl: false,
  preferCanvas: false,
  crs: Leaflet.CRS.Simple,
  maxBounds: [
    [0, 0],
    [IMG_HEIGHT, IMG_WIDTH],
  ],
  maxBoundsViscosity: 1.0,
  maxZoom: 2,
  zoomSnap: 0,
  zoomControl: false,
};

const BASE_COLORS = {
  primary: "#37847F",
  secondary: "#000F4B",
  highlight: "#EE7444",
  nature: "#7B9E32",
  icon: "#FFFFFF",
};

const NEW_COLORS = new Promise((resolve) => {
  function loadCSSAndGetColors() {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme') || 'default';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `styles/themes/${theme}.css`;

    link.onload = () => {
      const root = document.documentElement;
      const colors = Object.keys(BASE_COLORS).reduce(
        (colors, key) => ({
          ...colors,
          [key]:
            getComputedStyle(root).getPropertyValue(`--${key}-color`).trim() || "#000",
        }),
        {}
      );
      resolve(colors);
    };

    document.head.appendChild(link);
  }

  loadCSSAndGetColors();
});


export {
  BUTTON_HTML,
  IMG_WIDTH,
  IMG_HEIGHT,
  ANIMATIONS,
  MAP_CONFIG,
  ANIMATION_FILES,
  BASE_COLORS,
  NEW_COLORS,
};
