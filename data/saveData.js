const Db = require('./Database'),
      winston = require('../bin/winston')
;

/*
 | Handles saving new events.
*/
class saveData {

  constructor(rows) {

    this.data = rows;
    this.database = new Db();

    this.data.forEach((row) => {
      this.saveEvent(row);
    });

  }

  /*
   | @event -- originates from the cityCheck class as a result from querying the temp tables for new events.
   | async class in order to delay internal progress until the database has finished reading the data.
   | uses the event type passed to the class to decide which table to store the event in.
   | writes the data to the permanent tables for long term storage.
  */
  async saveEvent(row) {

    const data = JSON.parse(row.EventData);
    const eventType = data.type;
    const event = this.formatData(data, eventType);

    this.saveCityValues(event, eventType);

    let permTable = "",
        tempTable = "nn_events_temp",
        columnEventId = row.id,
        flatData = {};

    if (eventType === "checkin.created") {
      permTable = "nn_checkins_perma";
    } else {
      permTable = "nn_reviews_perma";
    }

    const sql = `INSERT IGNORE INTO ${permTable} SET ?`;
    const writtenData = await this.database.writePool(sql, event);

    if (typeof writtenData !== 'undefined' && writtenData.affectedRows > 0) {
      winston.info( "The following data was written to the database %j", event);

      const deleteSql = `DELETE FROM ${tempTable} WHERE id = '${columnEventId}'`;
      await this.database.QueryOnly(deleteSql);
    }

  }

  /*
 | @event -- originates from the cityCheck class as a result from querying the temp tables for new events.
 | async class in order to delay internal progress until the database has finished reading the data.
 | Starts by checking if the event has already been added, if it has not then we will create
 | a new query to either add a new city/state column and add a value of 1, or we will
 | increase the value of an existing city/state column by 1.
*/
  async saveCityValues(event, eventType) {

    /*
     | starts by checking to see if the event id already exists and if it does, exits the function and does not count as an extra checkin or review.
     */

    const typeTable = eventType === "checkin.created" ? "nn_checkins_perma" : "nn_reviews_perma";
    const eventID = event.EventID;
    const checkQuery = `SELECT id FROM ${typeTable} WHERE EventID = '${eventID}'`;
    const exists = await this.database.readPool(checkQuery);

    if (exists.length !== 0) return;

    const city = event.City,
      state = event.State,
      typeColumn = eventType === "checkin.created" ? "checkinTotal" : "reviewTotal",
      query = `INSERT INTO nn_city_totals (city, state, ${typeColumn})
                   VALUES ("${city}","${state}",1)
                   ON DUPLICATE KEY UPDATE ${typeColumn} = ${typeColumn} + 1`;
    this.database.QueryOnly(query);

  }

  formatData(row, eventType) {

    if (eventType === "checkin.created") {

      return {
        "EventID": row["id"],
        "CreatedAt": this.createReadableDate(row["createdAt"]),
        "CheckinId": row["data"]["id"],
        "CheckinDateTime": this.createReadableDate(row["data"]["createdAt"]),
        "Reference": row["data"]["reference"],
        "CheckinImageUrl": row["data"]["image"],
        "UserName": row["data"]["user"]["name"],
        "UserEmail": row["data"]["user"]["email"],
        "Street": row["data"]["location"]["street"],
        "City": row["data"]["location"]["city"],
        "State": row["data"]["location"]["state"],
        "PostalCode": row["data"]["location"]["postalCode"],
        "Country": row["data"]["location"]["country"],
        "Latitude": row["data"]["location"]["latitude"],
        "Longitude": row["data"]["location"]["longitude"]
      }

    } else {

      return {
        "EventID": row["id"],
        "CreatedAt": this.createReadableDate(row["createdAt"]),
        "ReviewSummary": row["data"]["summary"],
        "ReviewDetail": row["data"]["detail"],
        "ReviewRating": row["data"]["overallRating"],
        "RequestDate": this.createReadableDate(row["data"]["dateRequested"]),
        "ResponseDate": this.createReadableDate(row["data"]["dateResponded"]),
        "CustomerName": row["data"]["customer"]["name"],
        "CustomerEmail": row["data"]["customer"]["email"],
        "CustomerPhone" : row["data"]["customer"]["sms"],
        "CheckinId": row["data"]["checkin"]["id"],
        "CheckinDateTime" : this.createReadableDate(row["data"]["checkin"]["createdAt"]),
        "Reference" : row["data"]["checkin"]["reference"],
        "CheckinImageUrl" : row["data"]["checkin"]["image"],
        "UserName" : row["data"]["checkin"]["user"]["name"],
        "UserEmail" : row["data"]["checkin"]["user"]["email"],
        "Street": row["data"]["checkin"]["location"]["street"],
        "City": row["data"]["checkin"]["location"]["city"],
        "State": row["data"]["checkin"]["location"]["state"],
        "PostalCode": row["data"]["checkin"]["location"]["postalCode"],
        "Country": row["data"]["checkin"]["location"]["country"],
        "Latitude": row["data"]["checkin"]["location"]["latitude"],
        "Longitude": row["data"]["checkin"]["location"]["longitude"]
      }
    }
  }

  createReadableDate(date) {
    return new Date(date * 1000).toLocaleString();
  }

}

module.exports = saveData;
