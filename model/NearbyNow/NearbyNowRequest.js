export default class NearbyNowRequest {

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
      storefronttoken : process.env.NN_API_TOKEN,
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