const Db = require('./Database');

/*
 | @data -- an object containing the event body as it was sent from nearby now
 | @requestType -- a string of either checkin or review.
 | Creates new rows in the temp db tables using the event data.
*/

class Create {

  constructor(data, requestType) {

    this.data = data;
    this.database = new Db();

    if (requestType === 'checkin') {
      this.insertCheckin(this.database, this.data);
    } else if (requestType === 'review') {
      this.insertReview(this.database, this.data);
    }

  }

  /*
   | @database -- an instance of the Database class.
   | @data -- an object containing the event body as it was sent from nearby now
   | Performs an INSERT query into the checkin_temp folder.
  */

  insertCheckin(database, data) {

    const values = {
      "EventID": data["id"],
      "CheckinDateTime": this.convertDate(data["createdAt"]),
      "CheckinId": data["data"]["id"],
      "Location": JSON.stringify(data["data"]["location"]),
      "Reference": data["data"]["reference"],
      "CheckinImageUrl": data["data"]["image"],
      "UserName": data["data"]["user"]["name"],
      "UserEmail": data["data"]["user"]["email"]
    };

    let sql = "INSERT INTO nn_checkins_temp SET ?";

    database.writePool(sql, values);

  }

  /*
   | @database -- an instance of the Database class.
   | @data -- an object containing the event body as it was sent from nearby now
   | Performs an INSERT query into the reviews_temp folder.
  */

  insertReview(database, data) {
  	
    const values = {
      "EventID": data["id"],
      "CreatedAt": this.convertDate(data["createdAt"]),
      "ReviewSummary": data["data"]["summary"],
      "ReviewDetail": data["data"]["detail"],
      "ReviewRating": data["data"]["overallRating"],
      "ResponseDate": this.convertDate(data["data"]["dateResponded"]),
      "CustomerName": data["data"]["customer"]["name"],
      "CustomeEmail": data["data"]["customer"]["email"],
      "CheckinId": data["data"]["checkin"]["id"],
      "CheckinDateTime": this.convertDate(data["data"]["checkin"]["createdAt"]),
      "Location": JSON.stringify(data["data"]["checkin"]["location"]),
      "Reference": data["data"]["checkin"]["reference"],
      "CheckinImageUrl": data["data"]["checkin"]["image"],
      "UserName": data["data"]["checkin"]["user"]["name"],
      "UserEmail": data["data"]["checkin"]["user"]["email"]
    };

    let sql = "INSERT INTO nn_reviews_temp SET ?";

    database.writePool(sql, values);

  }

  /*
   | Converts the unix formatted time sent from nearby now into a more readable format for storage
  */

  convertDate(date) {
    return new Date(date * 1000);
  }

}

module.exports = {Create: Create};