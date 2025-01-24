
# Digital twin - Visualisation

Visualisation for a digital twin in the form of an interactive sensor map.


![Logo](https://raw.githubusercontent.com/stadtosnabrueck/smart_city_digital_twin_visualisation/refs/heads/main/screenshot.png)


## Installation
1. Make sure Node.js is installed on your machine. If not, you can download it [here](https://nodejs.org/).
2. Clone the repository to your local machine.
3. Navigate to the project directory in your terminal.
4. Run `npm install` to install the project's dependencies.
5. Run `npm run dev` to start the development server.

## Build
1. Run `npm run build` to build the project for production.
2. The build artifacts will be stored in the `dist/` directory.
3. From root directory in your terminal, use `serve -s dist` to serve the build artifacts. (Install it via `npm install -g serve`)    

## Use
To use the map, all files from the ‘dist’ folder of the archive must be uploaded to a web server. Opening the ‘index.html’ locally does not lead to the desired result due to security mechanisms in the browser and instead only displays a blank page. As soon as the files have been successfully uploaded to the web server, the map is displayed in the browser over the entire window.

## Example of integration via iframe
The file ‘iframe-example.html’ contains a simple example for integrating the map. Here, the link to the map must be adapted accordingly so that it refers to the corresponding web server. Apart from this, no further changes are necessary. The embedded map automatically adapts to the available size of the iframe. We only recommend setting the frame of the iframe to ‘none’ via CSS, as many browsers display an unattractive border around iframes by default.

## Customisation of marker positions and texts
The texts and positions of the markers can be customised in the ‘dist/data/markers.json’ file. This file is loaded each time the map is called up and contains the instructions for displaying the individual markers.

## Customisation of the colour scheme
The colours used in the map can be adapted using so-called ‘themes’. A theme is a .css file that defines colour variables that can be changed as required. You will already find two ready-made themes in the ‘dist/styles/themes/’ directory. You can create any number of additional themes by copying the ‘default.css’ file, adjusting the colour values and giving the new file a URL-friendly name.

## Loading the map with a customised colour scheme
By default, the map uses the ‘default.css’ theme. However, this behaviour can be overridden by the URL parameter ‘/?theme=[css-file-name]’. For example, the ‘/?theme=swo’ parameter loads the ‘swo.css’ file and the map adopts the colours defined in it. Important: The specified theme name must match the file name of the .css file exactly. As long as this is observed, any number of colour schemes can be created and used.
