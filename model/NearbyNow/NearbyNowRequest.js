class NearbyNowRequest {

  _storeFrontToken = "667e6629-2662-4056-aa56-089b97c97bd9"

  constructor({
      state = 'GA',
      city = 'Atlanta',
      showMap = 'yes',
      zoom = 10,
      latitude = 33.9408179,
      longitude = -84.7022703,
      mapSize = 'large',
      mapScrollWheel = 'no',
      reviewPinMax = 100,
      cluster = 'yes',
      reviewStart = 1,
      checkInStart = 1,
      reviewCount = 10,
      checkInCount = 10,
      request,
    }  = {}) {

    this.queryParams = {
      storefronttoken : this._storeFrontToken,
      state : state,
      city : city,
      showmap : showMap,
      zoomlevel : zoom,
      latitude : latitude,
      longitude : longitude,
      mapsize : mapSize,
      mapscrollwheel : mapScrollWheel,
      reviewPinMax : reviewPinMax,
      cluster : cluster,
      reviewstart : reviewStart,
      checkinstart : checkInStart,
      reviewcount : reviewCount,
      checkincount : checkInCount,
      hosturl : request.protocol + "://" + request.hostname + request.baseUrl
    }

    this.endpoint = "api.sidebox.com";

  }

}

module.exports = NearbyNowRequest