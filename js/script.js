const carriers = {6: "lc", 1: "vf", 3: "ks"}
const bandClass ={1: "band-1", '1+': "band-1", 3: "band-3", '3+': "band-3", 7: "band-7", '7+': "band-7", 8: "band-8", '8+': "band-8", 38:"band-38", 40: "band-40"}
const shortCids = {
    'lc': {
      '1': [12, 22, 32, 42],
      '1+': [15, 25, 35, 45],
      '3': [11, 21, 31, 41],
      '7': [13, 23, 33, 43],
      '7+': [14, 24, 34, 44],
      '8': [19, 29, 39, 49]
    },
    'vf': {
      '1': [11, 12, 13],
      '1+': [14, 15, 16],
      '3': [31, 32, 33, 34],
      '3+': [35, 36, 37, 39],
      '7': [71, 72, 73, 74],
      '7+': [75, 76, 77, 79],
      '8': [81, 82, 83],
      '8+': [84, 85, 86, 89],
      '38': [61, 62, 63, 65, 66, 67]
    },
    'ks': {
      '1': [51, 52, 53],
      '1+': [54, 55, 56, 57, 58, 59],
      '3': [31, 32, 33],
      '3+': [34, 35, 36, 37],
      '7': [41, 42, 43],
      '7+': [44, 45, 46, 47],
      '8': [21, 22, 23],
      '8+': [24, 25, 26],
      '40': [61, 62, 63, 64, 161, 162, 163, 164]
    }
  }
const bingKey = 'QXVoaUNKSGxHemhnOTNJcVVIX29DcGxfLVpVcklFNlNQZnRseUdZVXZyOUFteDVuekEtV3FHY1BxdXlGWmw0TA=='

function base64ToBytes(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function createMap(currentMapId, averageLocationPoint, band_points){
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  const googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  }); 
  const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
  });

  const googleHybrid  = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
  });

  const Bing = L.tileLayer.bing(new TextDecoder().decode(base64ToBytes(bingKey)));
  
  const ersi =  L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'

  });
  
  const ersi_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  });
  
  const OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{
		attribution: 'Map data: &copy; <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 15
  });

  

  const band_layers = {};

  Object.entries(band_points).forEach(([key, coordinatesArray]) => {
    if (key && Array.isArray(coordinatesArray) && coordinatesArray.length > 0){
      const group = [];
      coordinatesArray.forEach(({ lat, lng, shortCID }) => {
        group.push(L.marker([lat,lng]).bindPopup(`<b>Band: ${key}<br>Cell: ${shortCID}`));
      });
      band_layers[`Band${key}`] = L.layerGroup(group);
    };
});
	console.log(band_layers);
  const map = L.map(currentMapId, {
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: 'topleft'
    },
    center: averageLocationPoint,
    zoom: 13,
    layers: [osm, ...Object.values(band_layers)]
  });

  var baseMaps = {
    "OpenStreetMap": osm,
    "Google street": googleStreets,
    "Google Satellite": googleSat,
    "Google Hybrid ": googleHybrid ,
	  "Bing": Bing,
    "ESRI": ersi,
	  "ESRI Topo": ersi_WorldTopoMap,
	  "OpenTopoMap": OpenTopoMap
  }

  var marker = L.marker(averageLocationPoint).bindPopup("<b>Center</b>").addTo(map).openPopup();

  const layerControl = L.control.layers(baseMaps, band_layers,{collapsed: false}).addTo(map).expand();
  
}

function showTotalRequests(total_requests, currentNodeId){
  let totalRrequestElement = document.getElementById(currentNodeId);
  totalRrequestElement.innerText = `Total requests: ${total_requests}`;
}

function showResponseData(requestDiv,responseData, carrier, band, eNode, band, shortCID){
  let eNodeCM = `https:\/\/www.cellmapper.net\/map?MCC=255&MNC=${carrier}&type=LTE&latitude=${responseData.location.lat}&longitude=${responseData.location.lng}&zoom=15&showTowers=true&showIcons=false&showTowerLabels=true&tilesEnabled=true&showOrphans=true`
  var nodeContent = `<div class="response-item ${bandClass[band]}"><a href="${eNodeCM}" target="_blank">${eNode}</a> | ${band} (${shortCID}) <a href="https://www.google.com/maps/place/${responseData.location.lat},${responseData.location.lng}" target="_blank">${responseData.location.lat},${responseData.location.lng}</a></div>`;
  requestDiv.innerHTML += nodeContent;
}

function average(points) {
  const latSum = points.reduce((sum, point) => sum + parseFloat(point.lat), 0);
  const lngSum = points.reduce((sum, point) => sum + parseFloat(point.lng), 0);

  const numPoints = points.length;
  const latAverage = latSum / numPoints;
  const lngAverage = lngSum / numPoints;

  return [latAverage, lngAverage];
}

async function get_lte_point(url, carrier, cellId, mobileNetworkCode){
  try{
    let response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "homeMobileCountryCode": 255,
            "radioType": "lte",
            "carrier": carrier,
            "considerIp": false,
            "cellTowers": [
              {
                "cellId": cellId,
                "mobileCountryCode": 255,
                "mobileNetworkCode": mobileNetworkCode
              }
            ]
          })
        })
    if (response.status == 200) {
      let json = await response.json();
      //console.log(json)
      return json
    }
  } catch(error) {
    console.log('Error:', error.message);
  }  
}

async function get_wcdma_point(url, carrier, cellId, mobileNetworkCode){
  try{
    let response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "homeMobileCountryCode": 255,
            "radioType": "wcdma",
            "carrier": carrier,
            "considerIp": false,
            "cellTowers": [
              {
                "cellId": cellId,
                "mobileCountryCode": 255,
                "mobileNetworkCode": mobileNetworkCode
              }
            ]
          })
        })
    if (response.status == 200) {
      let json = await response.json();
      //console.log(json)
      return json
    }
  } catch(error) {
    console.log('Error:', error.message);
  }  
}

async function get_gsm_point(url, carrier, cellId, mobileNetworkCode, LAC){
  try{
    let response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "homeMobileCountryCode": 255,
            "radioType": "gsm",
            "carrier": carrier,
            "considerIp": false,
            "cellTowers": [
              {
                "cellId": cellId,
                "locationAreaCode": LAC,
                "mobileCountryCode": 255,
                "mobileNetworkCode": mobileNetworkCode
              }
            ]
          })
        })
    if (response.status == 200) {
      let json = await response.json();
      //console.log(json)
      return json
    }
  } catch(error) {
    console.log('Error:', error.message);
  }  
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

var fileContent = '';
document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          fileContent = e.target.result;
      };
      reader.readAsText(file);
  } else {
      console.log('No file selected');
  }
});

document.getElementById('requestTypeRadio').addEventListener('change', function(event) {
  if (event.target.type === 'radio' && event.target.checked) {
      document.getElementById('first_eNode').required = (event.target.value !== 'bruteforce_file');
      document.getElementById('fileInputRow').style.display = (event.target.value == 'bruteforce_file') ? 'block' : 'none';
      document.getElementById('last_eNodeRow').style.display = (event.target.value == 'bruteforce') ? 'block' : 'none';
      document.getElementById("greedySector").checked = (event.target.value == 'bruteforce_file' || event.target.value == 'bruteforce');
  }
});



async function makeGeolocationRequest(event) {
  event.preventDefault();
  var apiKey = document.getElementById("apiKey").value;
  var eNode = document.getElementById("first_eNode").value.trim();
  var last_eNode = document.getElementById("last_eNode").value.trim();

  var carrier = document.querySelector('input[name="carrier"]:checked').value;
  var checkboxes = document.querySelectorAll('input[name="band"]:checked');
  var radioType = document.querySelector('input[name="radioType"]:checked').value;
  var requestType = document.querySelector('input[name="requestType"]:checked').value;
  var isGreedySector = document.getElementById("greedySector").checked;
  var isGreedyBand = document.getElementById("greedyBand").checked;

  var url = 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + apiKey;

  const band_points = {};
  const sector_points = {};
  const AVG_sectors = [];
  const AVG = [];
  const bands = [...checkboxes].map(checkbox => checkbox.value);
  const currentTime = new Date().toTimeString().split(' ')[0];
  const currentNodeId = `${eNode}-${currentTime}`;
  const currentMapId = `map-${currentNodeId}`;

  var total_requests = 0;
  let averageLocationMap = 'https://www.google.com/maps/dir/';
  
  var responseElement = document.getElementById("response");
  var requestDiv = document.createElement('div');

  requestDiv.classList.add('request-group');
  requestDiv.innerHTML += `<div class="response-item average" id="${currentNodeId}"> Total requests: ${total_requests}</div>`;
  responseElement.appendChild(requestDiv);

  
  ////////////////////////
  if (requestType == 'single_request'){
    
    if (radioType == 'lte'){

      for (let band of bands){
        if (!(band in band_points)){
          band_points[band] = []
        }

        if (!shortCids[carriers[carrier]][band]){
          continue;
        }
        let isBandFound = false;

        for (let shortCID of shortCids[carriers[carrier]][band]){
          try {
            total_requests += 1;
            showTotalRequests(total_requests, currentNodeId);

            const responseData = await get_lte_point(url, carriers[carrier], parseInt(eNode*256 + shortCID), parseInt(carrier))
            responseData.location.shortCID = shortCID;
            if (carrier === 6) {
              var sector = Math.floor(shortCID/10)
            } else {
              var sector = Math.floor(shortCID/10)%10
            }

            if(!(sector in sector_points)){
              sector_points[sector] = [];
            }
            sector_points[sector].push(responseData.location);

            band_points[band].push(responseData.location);
            AVG.push(responseData.location);
            averageLocationMap += `${responseData.location.lat},${responseData.location.lng}/`

            //showResponseData(requestDiv, responseData, carrier, band, eNode, band, shortCID)
			      requestDiv.innerHTML += `<div class="response-item ${bandClass[band]}">${eNode} | ${band} (${shortCID}) ${responseData.location.lat},${responseData.location.lng}</div>`;
            isBandFound = true;
            if (isGreedySector){
              break;
            }
            await sleep(500);
          } catch (error){
            console.log('Error:', error.message);
          }
        }
        if (isGreedyBand && isBandFound){
          break;
        }
      }
    }  


    //////////////////////////
    if (radioType == 'wcdma'){
      var rncID = document.getElementById("rnc_lac").value.trim();

      if (carrier == '1'){
        for (let sector = 1; sector <= 9; sector++){
          let CID = eNode + sector;

          try {
              total_requests += 1;
              const responseData = await get_wcdma_point(url, carriers[carrier], parseInt(rncID*65536 + parseInt(CID)), parseInt(carrier))
              AVG.push(responseData.location);
              averageLocationMap += `${responseData.location.lat},${responseData.location.lng}/`
          
              var nodeContent = `<div class="response-item wcdma_vf">${eNode} | ${sector}  <a href="https://www.google.com/maps/place/${responseData.location.lat},${responseData.location.lng}" target="_blank">${responseData.location.lat},${responseData.location.lng}</a></div>`;
              requestDiv.innerHTML += nodeContent;
            } catch (error){
              console.log('Error:', error.message);
            }
        }  
      }

      if (carrier == '3'){
        let ks_sectors = ['5','6','7']

        for (let sector of ks_sectors){
          let CID = eNode + sector;

          try {
              total_requests += 1;
              const responseData = await get_wcdma_point(url, carriers[carrier], parseInt(rncID*65536 + parseInt(CID)), parseInt(carrier))
              AVG.push(responseData.location);
          
              var nodeContent = `<div class="response-item wcdma_ks">${eNode} | ${sector}  ${responseData.location.lat},${responseData.location.lng}</div>`;
              requestDiv.innerHTML += nodeContent;
            } catch (error){
              console.log('Error:', error.message);
            }

        }
      }

      if (carrier == '6'){
        for (let sector = 0; sector < 3; sector++){
          let CID = parseInt(eNode) + 1000*sector + '1';
          console.log(CID)

          try {
            total_requests += 1;
            const responseData = await get_wcdma_point(url, carriers[carrier], parseInt(rncID*65536 + parseInt(CID)), parseInt(carrier))
            AVG.push(responseData.location);

            var nodeContent = `<div class="response-item wcdma_lc">${CID} | ${responseData.location.lat},${responseData.location.lng}</div>`;
            requestDiv.innerHTML += nodeContent;
          } catch (error){
            console.log('Error:', error.message);
          }

        }

      }
    }


    ///////////////////////
    if (radioType == 'gsm'){
      var rncID = document.getElementById("rnc_lac").value.trim();

      if (carrier == '3'){
        for (let sector = 1; sector <= 3; sector++){
          let CID = eNode + sector;
          try {
            total_requests += 1;
            const responseData = await get_gsm_point(url, carriers[carrier], parseInt(CID), parseInt(carrier), rncID)
            AVG.push(responseData.location);
            total_requests += 1;

            var nodeContent = `<div class="response-item wcdma_ks">${eNode} | ${sector}  ${responseData.location.lat},${responseData.location.lng}</div>`;
            requestDiv.innerHTML += nodeContent;
          } catch (error){
            console.log('Error:', error.message);
          }


        }
      } else {
        for (let sector = 1; sector <= 8; sector++){
          let CID = eNode + sector;

          try {
            total_requests += 1;
            const responseData = await get_gsm_point(url, carriers[carrier], parseInt(CID), parseInt(carrier), rncID)
            AVG.push(responseData.location);

            if (carrier == '1'){
              var nodeContent = `<div class="response-item wcdma_vf">${eNode} | ${sector}  ${responseData.location.lat},${responseData.location.lng}</div>`;
              requestDiv.innerHTML += nodeContent;
            }

            if (carrier == '6'){
              var nodeContent = `<div class="response-item wcdma_lc">${eNode} | ${sector}  ${responseData.location.lat},${responseData.location.lng}</div>`;
              requestDiv.innerHTML += nodeContent;
            
            }
          } catch (error){
            console.log('Error:', error.message);
          }

        }

      }

    }

    if (AVG.length > 0){
      //console.log(sector_points);
      Object.entries(sector_points).forEach(([key, coordinatesArray]) => {
        AVG_sectors.push({lat: average(coordinatesArray)[0], lng: average(coordinatesArray)[1]});
        //console.log(key, coordinatesArray);
      });
      let averageSectorLocationPoint = average(AVG_sectors);
      let averageLocationPoint = average(AVG);
	    console.log(averageLocationPoint, averageSectorLocationPoint);
      
	    if(averageLocationPoint[0] !== averageSectorLocationPoint[0]){
		    averageLocationPoint = averageSectorLocationPoint;
	    };
      requestDiv.innerHTML += `<div class="response-item average"> Average Location: ${averageLocationPoint}`;
      requestDiv.innerHTML += `<div class="response-item average"><a href="${averageLocationMap}${averageLocationPoint}//" target="_blank">[GOOGLE]</a>   <a href="https:\/\/www.cellmapper.net\/map?MCC=255&MNC=${carrier}&type=LTE&latitude=${averageLocationPoint[0]}&longitude=${averageLocationPoint[1]}&zoom=15&showTowers=true&showIcons=false&showTowerLabels=true&tilesEnabled=true&showOrphans=true" target="_blank">[CM]</a></div>`;

	    requestDiv.innerHTML += `<div class="map" id="${currentMapId}"></div>`;

      createMap(currentMapId, averageLocationPoint, band_points);
    }
  }

  if (requestType == 'bruteforce'){
    if ((last_eNode - eNode) > 500){
      alert("range too large");
      return;
    }
    for (var currentNode = eNode; currentNode <= last_eNode; currentNode++){
      for (let band of bands){
        if (!shortCids[carriers[carrier]][band]){
          break;
        }
        let isBandFound = false;
        for (let shortCID of shortCids[carriers[carrier]][band]){
          try {
            total_requests += 1;
            showTotalRequests(total_requests, currentNodeId);
            const responseData = await get_lte_point(url, carriers[carrier], parseInt(currentNode*256 + shortCID), parseInt(carrier), shortCID, band, currentNode, requestDiv)
            if(responseData){
              showResponseData(requestDiv, responseData, carrier, band, currentNode, band, shortCID)
              isBandFound = true
              if(isGreedySector){
                break;
              }
            }
          } catch (error){
            console.log('Error:', error.message);
          }
        }
        await sleep(500);
        if (isGreedyBand && isBandFound){
          break;
        }
      }
    }
  }
  if (requestType == 'bruteforce_file'){
    let validNumbers = [];  
  
    if (fileContent) {
      const lines = fileContent.split('\r\n');
      validNumbers = lines
      .map(line => line.trim())
      .filter(line => line.length === 6 && !isNaN(line));      
      console.log(validNumbers);
    } else {
        alert('No file content to process. Please upload a file first.');
    }

    for (let currentNode of validNumbers){
      for (let band of bands){
        if (!shortCids[carriers[carrier]][band]){
          break;
        }
        let isBandFound = false;
        for (let shortCID of shortCids[carriers[carrier]][band]){
          try {
            total_requests += 1;
            showTotalRequests(total_requests, currentNodeId);
            const responseData = await get_lte_point(url, carriers[carrier], parseInt(currentNode*256 + shortCID), parseInt(carrier), shortCID, band, currentNode, requestDiv)
            if(responseData){
              showResponseData(requestDiv, responseData, carrier, band, currentNode, band, shortCID)
              isBandFound = true
              if(isGreedySector){
                break;
              }
            }
          } catch (error){
            console.log('Error:', error.message);
          }
        }
        await sleep(500);
        if (isGreedyBand && isBandFound){
          break;
        }
      }
    }


  }
}