const carriers = {6: "lc", 1: "vf", 3: "ks"}
const bandClass ={1: "band-1", 3: "band-3", 7: "band-7", 8: "band-8", 38:"band-38", 40: "band-40"}
const shortCids = {
    'lc': {
      '1': [12, 22, 32, 15, 25, 35],
      '3': [11, 21, 31, 41],
      '7': [13, 23, 33, 43, 14, 24, 34, 44],
      '8': [19, 29, 39, 49]
    },
    'vf': {
      '1': [11, 12, 13, 14, 15],
      '3': [31, 32, 33, 34],
      '7': [71, 72, 73, 74],
      '8': [81, 82, 83, 84, 85],
      '38': [61, 62, 63, 64]
    },
    'ks': {
      '1': [51, 52, 53, 54, 55, 56],
      '3': [31, 32, 33, 34, 35, 36, 37, 39],
      '7': [41, 42, 43, 44, 45, 46, 47],
      '8': [21, 22, 23, 24, 25, 26],
      '40': [61, 62, 63, 64]
    }
  }

function average(points) {
  //if (!points || points.length === 0) {
  //  return 0;
  //}
  const latSum = points.reduce((sum, point) => sum + parseFloat(point.lat), 0);
  //console.log(latSum)

  const lngSum = points.reduce((sum, point) => sum + parseFloat(point.lng), 0);
  //console.log(lngSum)

  const numPoints = points.length;
  const latAverage = latSum / numPoints;
  const lngAverage = lngSum / numPoints;

  return `${latAverage},${lngAverage}`;
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


async function makeGeolocationRequest(event) {
  event.preventDefault();
  var apiKey = document.getElementById("apiKey").value;
  var carrier = document.getElementById("carrier").value;
  var eNode = document.getElementById("eNode").value.trim();
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var radioType = document.querySelector('input[type="radio"]:checked').value;
  var url = 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + apiKey;

  const band_points = {};
  //let G = [];
  const AVG = []
  
  var requestDiv = document.createElement('div');
  requestDiv.classList.add('request-group');

  //console.log(radioType)
  if (radioType == 'lte'){
    var bands = [];
    for (var i = 0; i < checkboxes.length; i++) {
      bands.push(checkboxes[i].value);
    }
  

    for (let band of bands){
      if (!(band in band_points)){
        band_points[band] = []
      }
      for (let shortCID of shortCids[carriers[carrier]][band]){
        try {
        const responseData = await get_lte_point(url, carriers[carrier], parseInt(eNode*256 + shortCID), parseInt(carrier))
          band_points[band].push(responseData.location);
          AVG.push(responseData.location);

          var nodeContent = `<div class="response-item ${bandClass[band]}">${eNode} | ${band} (${shortCID}) ${responseData.location.lat},${responseData.location.lng}</div>`;
          requestDiv.innerHTML += nodeContent;
        } catch (error){
          console.log('Error:', error.message);
        }
      }
    }
    let averageLocationPoint = average(AVG)
    var averageLocation = `<div class="response-item average"> Average Location: <a href="https://www.google.com/maps/place/${averageLocationPoint}">${averageLocationPoint}</a> </div>`;
    requestDiv.innerHTML += averageLocation;

    var responseElement = document.getElementById("response");
    responseElement.appendChild(requestDiv);
  }  
  
  if (radioType == 'wcdma'){
    //console.log(radioType)
    var rncID = document.getElementById("rnc_lac").value.trim();

    if (carrier == '1'){
      //console.log(radioType, carrier)

      for (let sector = 1; sector <= 9; sector++){
        let CID = eNode + sector;
        //console.log(parseInt(rncID*65536 + parseInt(CID)), CID, rncID)
        try {
          const responseData = await get_wcdma_point(url, carriers[carrier], parseInt(rncID*65536 + parseInt(CID)), parseInt(carrier))
            AVG.push(responseData.location);
  
            var nodeContent = `<div class="response-item wcdma_vf">${eNode} | ${sector}  ${responseData.location.lat},${responseData.location.lng}</div>`;
            requestDiv.innerHTML += nodeContent;
          } catch (error){
            console.log('Error:', error.message);
          }
      }  
    }
    let averageLocationPoint = average(AVG)
    var averageLocation = `<div class="response-item average"> Average Location: <a href="https://www.google.com/maps/place/${averageLocationPoint}">${averageLocationPoint}</a> </div>`;
    requestDiv.innerHTML += averageLocation;

    var responseElement = document.getElementById("response");
    responseElement.appendChild(requestDiv);
  }
  //console.log(band_points)
  //console.log(AVG)
  //console.log(average(AVG))
}