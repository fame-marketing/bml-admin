const db = require('./db');

class Create {

  constructor(data,requestType) {

    this.data = data;
    this.database = new db.db;

    if(requestType === 'checkin') {
      this.insertCheckin(this.database,this.data);
    } else if (requestType === 'review') {
      this.insertReview(this.database,this.data);
    }


  }

  insertCheckin(database,data) {


    const values = {
      "eventID": data["id"],
      "createdAt": data["createdAt"],
      "checkinId": data["data"]["id"],
      "location": JSON.stringify(data["data"]["location"]),
      "reference": data["data"]["reference"],
      "image": data["data"]["image"],
      "userName": data["data"]["user"]["name"],
      "userEmail": data["data"]["user"]["email"]
    };

    let sql = "INSERT INTO nn_checkins SET ?";

    database.createConnection();

    database.query(sql,values);

    database.endConnection();

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
    let sql = "INSERT INTO nn_reviews (" + columns + ") VALUES ?";

    database.createConnection();

    database.query(sql,values);

    database.endConnection();

  }

}

module.exports = {Create:Create};