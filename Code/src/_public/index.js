import io from "socket.io-client";
import "./app.css";
import { configs } from "../_server/static/configs.js";
import { drawPcp } from "./newpcp.js";
import { draw_scatterplot } from "./scatterplot.js";
import { drawKmeansScatterplot } from "./kmeans_scatterplot.js";
import * as d3 from "d3";

let hostname = window.location.hostname;
let protocol = window.location.protocol;
const socketUrl = `${protocol}//${hostname}:${configs.port}`;

export const socket = io(socketUrl);

socket.on("connect", () => {
  console.log("Connected to " + socketUrl + ".");
});

socket.on("disconnect", () => {
  console.log("Disconnected from " + socketUrl + ".");
});

/**
 * Request data from the server based on parameters.
 * @param {*} parameters
 */
let requestData = (parameters) => {
  console.log(`Requesting data from webserver with parameters:`, parameters);
  socket.emit("getData", { parameters });
};


let requestLDA = (parameters) =>{
  console.log(`Requesting data with this parameters: `, parameters)
  socket.emit("getLDA",{parameters});
}

let handleLDA = (payload) =>{
  console.log("Data received from server:", payload);
ldaData.scatterplot = payload.data;
draw_scatterplot(ldaData.scatterplot);


};
socket.on("freshLDA", handleLDA);

let requestKmeansData = (parameters) =>{ 
  console.log(`Requesting data with this parameters: `, parameters)
 
  socket.emit("getRelevantData",{parameters});
}

let handleKmeansData = (payload) =>{
 
  kmeansData.kmeans_scatterplot = payload.data;
  console.log(" Data : ", kmeansData.kmeans_scatterplot )
  drawKmeansScatterplot(kmeansData.kmeans_scatterplot);

  
}

socket.on("RelevantData", handleKmeansData);



/**
 * Handle data received from the server.
 * @param {*} payload
 */
let handleData = (payload) => {
  console.log("Data received from server:", payload);
  data.pcp = payload.data;
  drawPcp(data.pcp);
};

socket.on("freshData", handleData);

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("load_data_button").onclick = () => {
    const categoryElement = document.getElementById("category");
    const category = categoryElement ? categoryElement.value : null;

    const topRankedElement = document.getElementById("top_rank");
    const top_rank = topRankedElement ? parseInt(topRankedElement.value) : Infinity;

    const mechanicElement = document.getElementById("mechanic");
    const mechanic = mechanicElement ? mechanicElement.value : null;

    const parameters = { top_rank, category, mechanic };

    requestData(parameters);
  };

  document.getElementById("load_data_button2").onclick = () => {
    const selectElement = document.getElementById("classes");
    const setClass = selectElement.value;

    const categoryElement = document.getElementById("category");
    const category = categoryElement ? categoryElement.value : null;

    const topRankedElement = document.getElementById("top_rank");
    const top_rank = topRankedElement ? parseInt(topRankedElement.value) : Infinity;

    const mechanicElement = document.getElementById("mechanic");
    const mechanic = mechanicElement ? mechanicElement.value : null;

    const parameters = { top_rank, category, mechanic, setClass };

    requestLDA(parameters);
  };
});
/**
 * Object that will store the loaded data.
 */

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('load_data_button_kmeans').addEventListener('click', function() {
    
    const topRank = document.getElementById('top_rank_kmeans').value;
  
    // Get the selected number of clusters
    const numClusters = document.getElementById('kmeans').value;
  
    // Get the selected distance metric
    const distanceMetric = document.getElementById('distance').value;
  
    // Initialize an object to store feature data
    let features = [];
  
    // Get all feature items
    const featureItems = document.querySelectorAll('.feature-item');
  
    // Loop through each feature item
    featureItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const slider = item.querySelector('input[type="range"]');
      if (checkbox.checked) {
        features.push({
          name: checkbox.value,
          importance: slider.value
        });
      
          
      }
          //importance: slider.value
        });
        const parameters = {
          top_rank: topRank,
          k: numClusters,
          features: features.map(feature => feature.name), // Extract names from features
  importance: features.map(feature => feature.importance), // Extract importance values
          distanceFunction: distanceMetric
        };
        requestKmeansData(parameters)
      
}); 
  
    // Log the captured values (You can replace this with your actual data handling logic)
    
   
  });




let ldaData ={
  scatterplot : undefined,
};
let data = {
  pcp: undefined,
};

let kmeansData = {
  kmeans_scatterplot: undefined,
};



