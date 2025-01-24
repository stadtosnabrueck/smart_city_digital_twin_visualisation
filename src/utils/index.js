import Leaflet from "leaflet";
import { IMG_HEIGHT } from "../constants";

const isMobile = () => {
  if (!window) return false;
  return window.innerWidth < 768;
};

const getMapFilePath = (format) => {
  const mapRoot = "map/";
  let imageFile = "City_MAP_fast_v04.svg";

  return mapRoot + imageFile;
};


const createFPSCounter = () => {
  const fpsContainer = Leaflet.DomUtil.create("div", "leaflet-fps-counter");

  let frameCount = 0;
  let lastTime = performance.now();

  const updateFPS = () => {
    const now = performance.now();
    frameCount++;
    const deltaTime = now - lastTime;

    if (deltaTime >= 1000) {

      const fps = Math.round((frameCount * 1000) / deltaTime);
      fpsContainer.textContent = `FPS: ${fps}`;
      frameCount = 0;
      lastTime = now;
    }

    requestAnimationFrame(updateFPS);
  };

  updateFPS();
  return fpsContainer;
};


const adjustLatLng = (latLng) => {
  const invertedY = IMG_HEIGHT - latLng[1];
  return [invertedY, latLng[0]];
};

const createCanvasElement = (width, height, className, id) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  if (className) canvas.className = className;
  if (id) canvas.id = id;

  return canvas;
};

const buildPopupContent = (headline, body) => `
  <div class="popup-content">
    <h3 class="popup-headline">${headline}</h3>
    <p class="popup-body">${body}</p>
  </div>
`;

const handleScalingObject = (map, target) => {
  const zoom = map.getZoom();
  const scale = Math.pow(2, zoom);
  target.style.transform = `scale(${scale})`;
  target.style.transformOrigin = "top left";
};

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

function updateRiveColorInputs(baseColors, newColors, stateMachineInputs) {

  for (const key in baseColors) {

    const colorInputs = ["R", "G", "B"].reduce((acc, channel) => {
      acc[channel] = stateMachineInputs.find(
        (input) => input.name === `c_${key}_${channel}`
      );
      return acc;
    }, {});


    if (colorInputs.R && colorInputs.G && colorInputs.B) {
      const newRGB = hexToRgb(newColors[key]);
      colorInputs.R.value = newRGB.r;
      colorInputs.G.value = newRGB.g;
      colorInputs.B.value = newRGB.b;
    }
  }
}


function replaceSVGColors(svgText, colorReplacements) {

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
  const styleTags = svgDoc.querySelectorAll("style");
  const svgElement = svgDoc.querySelector("svg");

  if (!svgElement) {
    throw new Error("No SVG element found");
  }

  const colorRegexList = colorReplacements.map((replacement) => ({
    from: new RegExp(
      replacement.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    ),
    to: replacement.to,
  }));


  styleTags.forEach((styleTag) => {
    let cssText = styleTag.textContent;
    colorRegexList.forEach(({ from, to }) => {
      cssText = cssText.replace(from, to);
    });
    styleTag.textContent = cssText;
  });


  const svgElements = svgElement.querySelectorAll("*");
  svgElements.forEach((element) => {
    const styleAttr = element.getAttribute("style");
    const fill = element.getAttribute("fill");
    const stroke = element.getAttribute("stroke");


    let modifiedStyle = styleAttr || "";

    colorRegexList.forEach(({ from, to }) => {

      if (styleAttr) {
        modifiedStyle = modifiedStyle.replace(new RegExp(from, "gi"), to);
      }


      if (fill && fill.toLowerCase() === from.source.toLowerCase()) {
        element.setAttribute("fill", to);
      }


      if (stroke && stroke.toLowerCase() === from.source.toLowerCase()) {
        element.setAttribute("stroke", to);
      }
    });


    if (modifiedStyle !== styleAttr) {
      element.setAttribute("style", modifiedStyle);
    }
  });


  const serializer = new XMLSerializer();
  const modifiedSVGString = serializer.serializeToString(svgElement);

  return modifiedSVGString;
}

function replaceSVGColors_unsafe(svgText, colorReplacements) {

  const combinedRegex = colorReplacements
    .map((replacement) => {
      return `${replacement.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
    })
    .join("|");


  const modifiedSVGString = svgText.replace(
    new RegExp(combinedRegex, "gi"),
    (matched) => {

      const replacement = colorReplacements.find(
        (r) => r.from.toLowerCase() === matched.toLowerCase()
      );
      return replacement ? replacement.to : matched;
    }
  );
  return modifiedSVGString;
}

export {
  isMobile,
  getMapFilePath,
  createFPSCounter,
  adjustLatLng,
  createCanvasElement,
  buildPopupContent,
  handleScalingObject,
  hexToRgb,
  updateRiveColorInputs,
  replaceSVGColors,
  replaceSVGColors_unsafe,
};
