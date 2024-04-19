import https from 'https'
import NearbyNowRequest from './NearbyNowRequest.js'

export default class GetReviewsAndCheckins extends NearbyNowRequest {

  constructor(req) {
    super(
      {request:req}
    )
  }

  async getNnData() {

    const resource = "/plugin/nearbyserviceareareviewcombo",
          query = '?' + new URLSearchParams(this.queryParams);

    const requestOptions = {
      hostname: this.endpoint,
      path: resource + query,
      method: 'GET'
    }

    console.log(requestOptions);

    const response = await https.request(
      requestOptions,
      res => {

        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (data) => {
          console.error(data)
        })

      }
    ).on('error', (err) => {
      console.error(err)
    });

  }

}