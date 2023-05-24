const Db = require('./Database'),
  winston = require('../bin/winston'),
  recentEventStorageHandler = require('./Db/storeRecentEvent'),
  deleteTempEventHandler = require('./Db/deleteTempEvent')
;

/*
 | Handles saving new events.
*/
class saveData {

  constructor(rows) {

    this.database = new Db();
    this.recentEventStorageHandler = recentEventStorageHandler;
    this.deleteTempEventHandler = deleteTempEventHandler;

    rows.forEach((row) => {
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

    let data = typeof row === 'string' ? JSON.parse(row.EventData) : row.EventData

    const eventType = data.type;
    const event = this.formatData(data, eventType);

    let permTable = eventType === "checkin.created" ? "nn_checkins_perma" : "nn_reviews_perma",
      rowId = row.id;

    await this.updateCityValues(event, rowId, permTable);

    const sql = `INSERT IGNORE INTO ${permTable} SET ?`;
    const writtenData = await this.database.writePool(sql, event);

    this.recentEventStorageHandler.store(event.EventId, event.CreatedAt, eventType);

    if (typeof writtenData !== 'undefined' && writtenData.affectedRows > 0) {
      winston.info( "The following data was written to the database %j", event);

      this.deleteTempEventHandler.delete(rowId);
    }

  }

  /*
 | @event -- originates from the cityCheck class as a result from querying the temp tables for new events.
 | async class in order to delay internal progress until the database has finished reading the data.
 | Starts by checking if the event has already been added, if it has not then we will create
 | a new query to either add a new city/state column and add a value of 1, or we will
 | increase the value of an existing city/state column by 1.
*/
  async updateCityValues(event, rowId, permTable) {

    /*
     | starts by checking to see if the event id already exists and if it does, exits the function and does not count as an extra checkin or review.
     */

    const eventId = event.EventId;
    const checkQuery = `SELECT id FROM ${permTable} WHERE EventId = '${eventId}'`;
    const exists = await this.database.readPool(checkQuery);

    if (exists.length !== 0) {
      this.deleteTempEventHandler.delete(rowId);
      return;
    }

    const city = event.City,
      state = event.State,
      typeColumn = permTable === "nn_checkins_perma" ? "checkinTotal" : "reviewTotal",
      query = `INSERT INTO nn_city_totals (city, state, ${typeColumn})
                   VALUES ("${city}","${state}",1)
                   ON DUPLICATE KEY UPDATE ${typeColumn} = ${typeColumn} + 1`;

    this.database.QueryOnly(query);

  }

  /*
   | This function maps the event data received from Nearby Now to the correct columns in the database.
   | This function will also reformat any dates from unix timestamps to a more readable format.
   */
  formatData(row, eventType) {

    if (eventType === "checkin.created") {

      return {
        "EventId": row["id"],
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
        "EventId": row["id"],
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

  /*
   | formats the unix timestamp received from Nearby Now into a more readable format.
   */
  createReadableDate(date) {

    function force2Digits(number) {
      return number < 10 ? '0' + number : number;
    }

    const dateObj = new Date(date * 1000);
    const dateFormat = dateObj.getFullYear() + '-' + force2Digits(dateObj.getMonth()) + '-' + force2Digits(dateObj.getDate())
    const timeFormat = force2Digits(dateObj.getHours()) + ':' + force2Digits(dateObj.getMinutes()) + ':' + force2Digits(dateObj.getSeconds())
    const formattedDate = dateFormat + " " + timeFormat
    console.log(formattedDate)
    return formattedDate;
  }

}

module.exports = saveData;
