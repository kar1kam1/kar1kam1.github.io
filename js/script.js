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
      '7': [71, 72, 73, 74],
      '8': [81, 82, 83],
      '8+': [84, 85],
      '38': [61, 62, 63, 64, 65]
    },
    'ks': {
      '1': [51, 52, 53],
      '1+': [54, 55, 56],
      '3': [31, 32, 33],
      '3+': [34, 35, 36, 37],
      '7': [41, 42, 43],
      '7+': [44, 45, 46, 47],
      '8': [21, 22, 23],
      '8+': [24, 25, 26],
      '40': [61, 62, 63, 64]
    }
  }

function average(points) {
  const latSum = points.reduce((sum, point) => sum + parseFloat(point.lat), 0);
  const lngSum = points.reduce((sum, point) => sum + parseFloat(point.lng), 0);

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


async function makeGeolocationRequest(event) {
  event.preventDefault();
  var apiKey = document.getElementById("apiKey").value;
  var carrier = document.getElementById("carrier").value;
  var eNode = document.getElementById("first_eNode").value.trim();
  var last_eNode = document.getElementById("last_eNode").value.trim();

  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var radioType = document.querySelector('input[name="radioType"]:checked').value;
  var requestType = document.querySelector('input[name="requestType"]:checked').value;

  var url = 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + apiKey;

  const band_points = {};
  //let G = [];
  const AVG = []
  var total_requests = 0;
  let averageLocationMap = 'https://www.google.com/maps/dir/'
  
  var requestDiv = document.createElement('div');
  requestDiv.classList.add('request-group');

  
  ////////////////////////
  if (requestType == 'single_request'){
    
    if (radioType == 'lte'){
      var bands = [];
      for (var i = 0; i < checkboxes.length; i++) {
        bands.push(checkboxes[i].value);
      }
    

      for (let band of bands){
        if (!(band in band_points)){
          band_points[band] = []
        }

        if (!shortCids[carriers[carrier]][band]){
          break;
        }

        for (let shortCID of shortCids[carriers[carrier]][band]){
          try {
            total_requests += 1;
            const responseData = await get_lte_point(url, carriers[carrier], parseInt(eNode*256 + shortCID), parseInt(carrier))
            band_points[band].push(responseData.location);
            AVG.push(responseData.location);
            
            averageLocationMap += `${responseData.location.lat},${responseData.location.lng}/`

            var nodeContent = `<div class="response-item ${bandClass[band]}">${eNode} | ${band} (${shortCID}) <a href="https://www.google.com/maps/place/${responseData.location.lat},${responseData.location.lng}" target="_blank">${responseData.location.lat},${responseData.location.lng}</a></div>`;
            requestDiv.innerHTML += nodeContent;
          } catch (error){
            console.log('Error:', error.message);
          }
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

  }

  if (requestType == 'brutforce'){
    if((last_eNode - eNode) <= 100){
      if (radioType == 'lte'){
        var bands = [];

        for (var i = 0; i < checkboxes.length; i++) {
          bands.push(checkboxes[i].value);
        }
      
        for (let band of bands){
  
          if (!shortCids[carriers[carrier]][band]){
            break;
          }

          for (var currentNode = eNode; currentNode <= last_eNode; currentNode++){
            for (let shortCID of shortCids[carriers[carrier]][band]){
              try {
                total_requests += 1;
                const responseData = await get_lte_point(url, carriers[carrier], parseInt(currentNode*256 + shortCID), parseInt(carrier))
                if(responseData){
                  var nodeContent = `<div class="response-item ${bandClass[band]}">${currentNode} | ${band} (${shortCID}) <a href="https://www.google.com/maps/place/${responseData.location.lat},${responseData.location.lng}" target="_blank">${responseData.location.lat},${responseData.location.lng}</a></div>`;
                  requestDiv.innerHTML += nodeContent;
                  break;
                }
              } catch (error){
                console.log('Error:', error.message);
              }
            }
          }
        }
      }  
  
    }

  }

  if (AVG.length > 0){
    //console.log(AVG)
    let averageLocationPoint = average(AVG)
    var averageLocation = `<div class="response-item average"> Average Location: <a href="${averageLocationMap}/" target="_blank">${averageLocationPoint}</a> </div>`;
    requestDiv.innerHTML += averageLocation;
  }
    var totalRrequests = `<div class="response-item average"> Total requests: ${total_requests}</div>`;
    requestDiv.innerHTML += totalRrequests;
    var responseElement = document.getElementById("response");
    responseElement.appendChild(requestDiv);
  
  //console.log(band_points)
  //console.log(AVG)
  //console.log(average(AVG))
}