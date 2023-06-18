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

function makeGeolocationRequest(event) {
  event.preventDefault();
  var apiKey = document.getElementById("apiKey").value;
  var carrier = document.getElementById("carrier").value;
  var eNode = document.getElementById("eNode").value;
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var url = 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + apiKey;

  var bands = [];
  for (var i = 0; i < checkboxes.length; i++) {
    bands.push(checkboxes[i].value);
  }

  for (let band of bands){
    for (let shortCID of shortCids[carriers[carrier]][band]){
      //console.log(band, shortCID, parseInt(eNode*256 + shortCID), carriers[carrier], parseInt(carrier))
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "homeMobileCountryCode": 255,
          "radioType": "lte",
          "carrier": carriers[carrier],
          "considerIp": false,
          "cellTowers": [
            {
              "cellId": parseInt(eNode*256 + shortCID),
              "mobileCountryCode": 255,
              "mobileNetworkCode": parseInt(carrier)
            }
          ]
        })
      })
        .then(function(response) {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Network response was not OK.');
          }
        })
        .then(function(responseData) {
          // Process the response data here
          //console.log(responseData);
          var responseElement = document.getElementById("response");
          var responseContent = `${eNode} | ${band} (${shortCID}) ${responseData.location.lat},${responseData.location.lng}`;

          responseElement.innerHTML += `<div class="response-item ${bandClass[band]}">${responseContent}</div>`;
          })
        .catch(function(error) {
          // Handle any errors that occurred during the request
          console.log('Error:', error.message);
        });
    }  
  }
}