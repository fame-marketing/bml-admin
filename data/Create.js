const Db = require('./Database');

/*
 | @data -- an object containing the event body as it was sent from nearby now
 | @requestType -- a string of either checkin or review.
 | Creates new rows in the temp db tables using the event data.
*/
class Create {

  constructor(data,requestType) {

    this.data = data;
    this.database = new Db();

    if(requestType === 'checkin') {
      this.insertCheckin(this.database,this.data);
    } else if (requestType === 'review') {
      this.insertReview(this.database,this.data);
    }

  }

  /*
   | @database -- an instance of the Database class.
   | @data -- an object containing the event body as it was sent from nearby now
   | Performs an INSERT query into the checkin_temp folder.
  */
  insertCheckin(database,data) {

    const values = {
      "eventID": data["id"],
      "createdAt": this.convertDate(data["createdAt"]),
      "checkinId": data["data"]["id"],
      "location": JSON.stringify(data["data"]["location"]),
      "reference": data["data"]["reference"],
      "image": data["data"]["image"],
      "userName": data["data"]["user"]["name"],
      "userEmail": data["data"]["user"]["email"]
    };

    let sql = "INSERT INTO nn_checkins_temp SET ?";

    database.writePool(sql,values);

  }

  /*
   | @database -- an instance of the Database class.
   | @data -- an object containing the event body as it was sent from nearby now
   | Performs an INSERT query into the reviews_temp folder.
  */
  insertReview(database,data) {

    const columns = "eventID, createdAt, reviewSummary, reviewDetail, overallRating, reviewRequestedDate, reviewRespondedDate, reviewerName, reviewerEmail, checkinId, checkinCreatedAt, location, reference, image, userName, userEmail";
    const values = {
      "eventID": data["id"],
      "createdAt": this.convertDate(data["createdAt"]),
      "reviewSummary": data["data"]["summary"],
      "reviewDetail": data["data"]["detail"],
      "overallRating": data["data"]["overallRating"],
      "reviewRequestedDate": this.convertDate(data["data"]["dateRequested"]),
      "reviewRespondedDate": this.convertDate(data["data"]["dateResponded"]),
      "reviewerName": data["data"]["customer"]["name"],
      "reviewerEmail": data["data"]["customer"]["email"],
      "checkinId": data["data"]["checkin"]["id"],
      "checkinCreatedAt": this.convertDate(data["data"]["checkin"]["createdAt"]),
      "location": JSON.stringify(data["data"]["checkin"]["location"]),
      "reference": data["data"]["checkin"]["reference"],
      "image": data["data"]["checkin"]["image"],
      "userName": data["data"]["checkin"]["user"]["name"],
      "userEmail": data["data"]["checkin"]["user"]["email"]
    };
    let sql = "INSERT INTO nn_reviews_temp SET ?";

    database.writePool(sql,values);

  }

  /*
   | Converts the unix formatted time sent from nearby now into a more readable format for storage
  */
  convertDate(date) {
  	return new Date(date * 1000);
	}

}

module.exports = {Create:Create};