const Db = require('./Database')
;

class saveData {
	
	constructor (rows,eventType) {
		
		this.data = rows;
		this.eventType = eventType;
		this.database = new Db();
		this.flatData = {};

		this.data.forEach((row) => {
      this.saveCityValues(row);
		});
		
		this.data.forEach((row) => {
			this.saveEvent(row);
		});
		
	}
	
	async saveCityValues (row) {

	  /*
	   * starts by checking to see if the event id already exists and if it does, exits the function and does not count as an extra checkin or review.
	   */
    const typeTable = this.eventType === "checkin" ? "nn_checkins_perma" : "nn_reviews_perma";
	  const eventID = row.eventID;
	  const checkQuery = `SELECT id FROM ${typeTable} WHERE eventID = '${eventID}'`;
    const exists = await this.database.returnQueryPool(checkQuery);

    if (exists[0].length !== 0) return;

    const city = row.location.city,
          state = row.location.state,
          typeColumn = this.eventType === "checkin" ? "checkinTotal" : "reviewTotal",

          query = `INSERT INTO nn_city_totals (city, state, ${typeColumn})
                   VALUES ("${city}","${state}",1)
                   ON DUPLICATE KEY UPDATE ${typeColumn} = ${typeColumn} + 1`
    ;

		this.database.QueryOnly(query);
		
	}
	
	async saveEvent (event) {
		
		let permTable = "",
        tempTable = "",
		    columnEventId = event.eventID;

    if (this.eventType === "checkin") {
			permTable = "nn_checkins_perma";
      tempTable = "nn_checkins_temp";
      this.flattenObject(event);
		} else if (this.eventType === "review") {
			permTable = "nn_reviews_perma";
      tempTable = "nn_reviews_temp";
			this.flattenObject(event);
		} else {return}

		const sql = `INSERT IGNORE INTO ${permTable} SET ?`;

		await this.database.writePool(sql,this.flatData);

		const deleteSql = `DELETE FROM ${tempTable} WHERE eventID = '${columnEventId}'`;

		await this.database.QueryOnly(deleteSql);
		
	}

	/*
	 * Takes the basic object from NearbyNow and levels out all sub objects to be on the same level, this allows mysql to auto add values from the flattened object
	 */
	flattenObject (event) {

	  if (event.location) {
	    event.location = JSON.parse(event.location);
    }

    Object.entries(event).forEach(
			([key,value]) => {
        if (typeof value === "object" && Object.entries(value).length !== 0) {
					this.flattenObject(value);
				} else if (key === "id") {
				} else {
					this.flatData[key] = value;
				}
			}
		)
		
	}
	
}

module.exports = saveData;