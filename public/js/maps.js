;(function(w,d) {

  const messagesEl = d.getElementById('adminContent_messages');

  if (typeof google === 'undefined' || typeof google.maps === 'undefined') { //check if the google maps library has loaded or not

    messagesEl.innerText = "The maps library is taking some time to load... We will try to load again in just a second";

    setTimeout(() => {

      if (typeof google === 'undefined' || typeof google.maps === 'undefined') { // check once again if the google maps library has been loaded
        messagesEl.innerText = "Could not load the google maps library. Strange.";
      } else {
        messagesEl.innerText = "";
        getMapData(15);
      }

    }, 7000)
  } else {
    getMapData(15);
  }

  function initMaps(mapData) {

    const center = getCenter(mapData);

    const map = new google.maps.Map(d.getElementById('adminContent_map'), {
      center: {lat: center.lat, lng: center.lng},
      zoom: 11
    });

    mapData.forEach(location => {
      const title = location.Reference.slice(0);
      let marker = new google.maps.Marker({
        position: {lat:location.Latitude, lng:location.Longitude},
        map:map,
        title:title
      });
    })

  }

  function getCenter(data) {

    let longsTotal = 0,
        latsTotal = 0,
        locations = data.length
    ;

    data.forEach(location => {
      longsTotal += location.Longitude;
      latsTotal += location.Latitude;
    })

    const avgLong = longsTotal / locations,
          avgLat = latsTotal / locations;

    return {
      lng: avgLong,
      lat: avgLat
    };

  }

  function getMapData(recordNum) {

    const req = new XMLHttpRequest(),
          sendData = JSON.stringify({
            number : recordNum
          });

    req.open('POST', '/nn-admin/map', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(sendData);

    req.onloadstart = function() {
      messagesEl.innerText = "Fetching the maps data from the database. This may take a moment if there is a large amount of data";
    }

    req.onprogress = function(e) {
      messagesEl.innerText = "Loading Data... " + e.loaded + " of " + e.total;
    }

    req.onload = function () {
      messagesEl.innerText = "";
      if (req.status === 200) {
        initMaps(JSON.parse(this.responseText));
      } else {
        console.log("something happened. I dont even know what. " + this.status);
      }
    }

    req.onerror = function () {
      messagesEl.innerText = "We couldn't even make a successful connection attempt so that is not good. Discuss this with the webmaster";
    }

  }


})(window, document);