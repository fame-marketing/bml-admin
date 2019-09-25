const Db = require('./Database');

class Create {

  constructor(data,requestType) {

    this.data = data;
    this.database = new Db.Database;

    if(requestType === 'checkin') {
      this.insertCheckin(this.database,this.data);
    } else if (requestType === 'review') {
      this.insertReview(this.database,this.data);
    }

  }

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

  insertReview(database,data) {

    const columns = "eventID, createdAt, reviewSummary, reviewDetail, overallRating, reviewRequestedDate, reviewRespondedDate, reviewerName, reviewerEmail, checkinId, checkinCreatedAt, location, reference, image, userName, userEmail";
    const values = {
      "eventID": data["id"],
      "createdAt": data["createdAt"],
      "reviewSummary": data["data"]["summary"],
      "reviewDetail": data["data"]["detail"],
      "overallRating": data["data"]["overallRating"],
      "reviewRequestedDate": data["data"]["dateRequested"],
      "reviewRespondedDate": data["data"]["dateResponded"],
      "reviewerName": data["data"]["customer"]["name"],
      "reviewerEmail": data["data"]["customer"]["email"],
      "checkinId": data["data"]["checkin"]["id"],
      "checkinCreatedAt": data["data"]["checkin"]["createdAt"],
      "location": JSON.stringify(data["data"]["checkin"]["location"]),
      "reference": data["data"]["checkin"]["reference"],
      "image": data["data"]["checkin"]["image"],
      "userName": data["data"]["checkin"]["user"]["name"],
      "userEmail": data["data"]["checkin"]["user"]["email"]
    };
    let sql = "INSERT INTO nn_reviews_temp (" + columns + ") VALUES ?";

    database.writePool(sql,values);

  }
  
  convertDate(date) {
  	return new Date(date * 1000);
	}

}

module.exports = {Create:Create};