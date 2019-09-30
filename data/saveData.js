const Db = require('./Database')
;

class saveData {
	
	constructor (rows,eventType) {
		
		this.data = rows;
		this.eventType = eventType;
		this.database = new Db();
		
		console.log(this.data);
		
		this.data.forEach((row) => {
			this.saveCityValues(row['location']['city']);
		});
		
		this.data.forEach((row) => {
			this.saveEvent(row);
		})
		
	}
	
	saveCityValues (city) {
		
		const typeColumn = this.eventType === "checkin" ? "checkinTotal" : "reviewTotal";
		
		const query = "INSERT INTO nn_city_totals (cityName,total) " +
			"VALUES (" + city + ", 1) " +
			"ON DUPLICATE KEY UPDATE nn_city_totals " +
			"SET cityName = " + city + " " + typeColumn + " + 1";
		
		//this.database.writePoolQueryOnly(query);
		
	}
	
	saveEvent (event) {
		
		let table = "";
		
		if (this.eventType === "checkin") {
			table = "nn_checkins_perma";
		} else if (this.eventType === "review") {
			table = "nn_reviews_perma";
		} else {return}
		
		const sql = "INSERT INTO " + table + " SET ?";
		
		this.database.writePool(sql,event);
		
	}
	
}

module.exports = saveData;