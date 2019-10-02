const Db = require('./Database')
;

class saveData {
	
	constructor (rows,eventType) {
		
		this.data = rows;
		this.eventType = eventType;
		this.database = new Db();

		this.data.forEach((row) => {
		  const citName = JSON.parse(row['location']);
			this.saveCityValues(citName['city']);
		});
		
		this.data.forEach((row) => {
			this.saveEvent(row);
		});
		
	}
	
	saveCityValues (city) {

		const typeColumn = this.eventType === "checkin" ? "checkinTotal" : "reviewTotal";
		
		const query = "INSERT INTO nn_city_totals (cityName, " + typeColumn + ") " +
			"VALUES (" + city + ", 1) " +
			"ON DUPLICATE KEY UPDATE " + typeColumn + " = " + typeColumn + " + 1"
    ;

		console.log(query);

		this.database.writePoolQueryOnly(query);
		
	}
	
	saveEvent (event) {
		
		let table = "";
		
		if (this.eventType === "checkin") {
			table = "nn_checkins_perma";
		} else if (this.eventType === "review") {
			table = "nn_reviews_perma";
		} else {return}

		const sql = "INSERT INTO " + table + " SET ?";
		
		//this.database.writePool(sql,event);
		
	}
	
}

module.exports = saveData;