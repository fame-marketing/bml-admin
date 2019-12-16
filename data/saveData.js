const Db = require('./Database'),
  winston = require('../bin/winston')
;

/*
 | Handles saving new events.
*/
class saveData {

  constructor(rows, eventType) {

    this.data = rows;
    this.eventType = eventType;
    this.database = new Db();

    this.data.forEach((row) => {
      this.saveCityValues(JSON.parse(JSON.stringify(row)));
    });

    this.data.forEach((row) => {
      this.saveEvent(row);
    });

  }

  /*
   | @event -- originates from the cityCheck class as a result from querying the temp tables for new events.
   | async class in order to delay internal progress until the database has finished reading the data.
   | Starts by checking if the event has already been added, if it has not then we will create
   | a new query to either add a new city/state column and add a value of 1, or we will
   | increase the value of an existing city/state column by 1.
  */
  async saveCityValues(event) {

    /*
     | starts by checking to see if the event id already exists and if it does, exits the function and does not count as an extra checkin or review.
     */
	
		const typeTable = this.eventType === "checkin" ? "nn_checkins_perma" : "nn_reviews_perma";
    const eventID = event.EventID;
    const checkQuery = `SELECT id FROM ${typeTable} WHERE eventID = '${eventID}'`;
    const exists = await this.database.readPool(checkQuery);

    if (exists.length !== 0) return;
	
		if (event.Location && typeof event.Location === 'string') {
			event.Location = JSON.parse(event.Location);
		}
    
    const city = event.Location.city,
      state = event.Location.state,
      typeColumn = this.eventType === "checkin" ? "checkinTotal" : "reviewTotal",
      query = `INSERT INTO nn_city_totals (city, state, ${typeColumn})
                   VALUES ("${city}","${state}",1)
                   ON DUPLICATE KEY UPDATE ${typeColumn} = ${typeColumn} + 1`;
    this.database.QueryOnly(query);

  }

  /*
   | @event -- originates from the cityCheck class as a result from querying the temp tables for new events.
   | async class in order to delay internal progress until the database has finished reading the data.
   | uses the event type passed to the class to decide which table to store the event in.
   | writes the data to the permanent tables for long term storage.
  */
  async saveEvent(event) {

    let permTable = "",
      tempTable = "",
      columnEventId = event.EventID,
      flatData = {};

    if (this.eventType === "checkin") {
      permTable = "nn_checkins_perma";
      tempTable = "nn_checkins_temp";
      flatData = this.flattenObject(event);
    } else if (this.eventType === "review") {
      permTable = "nn_reviews_perma";
      tempTable = "nn_reviews_temp";
      flatData = this.flattenObject(event);
    } else {
      return
    }

    const sql = `INSERT IGNORE INTO ${permTable} SET ?`;
    const writtenData = await this.database.writePool(sql, flatData);

    const deleteSql = `DELETE FROM ${tempTable} WHERE eventID = '${columnEventId}'`;
    await this.database.QueryOnly(deleteSql);
    
    if (typeof writtenData !== 'undefined' && writtenData.affectedRows > 0) {
      winston.log('info', "The following data was written to the database %j", flatData);
    }
  }

  /*
   | @event -- originates from the cityCheck class as a result from querying the temp tables for new events.
   | parse the location data as it is usually in a string format when pulled from the db
   | remove and store the location data from the event then re add the data to the event as individual object
   | properties. return the event with the flattened structure.
   | TODO: make sure location details are forced to uppercase here.
  */
  flattenObject(event) {
  	
    if (event.Location && typeof event.Location === 'string') {
      event.Location = JSON.parse(event.Location);
    }

    const location = event.Location;
    delete event.Location;

    for (const detail in location) {
      if (location.hasOwnProperty(detail)) {
        event[detail] = location[detail];
      }
    }
    
    return event;

  }

}

module.exports = saveData;