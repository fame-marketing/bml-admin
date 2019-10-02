const Db = require('./Database')
;

class saveData {
	
	constructor (rows,eventType) {
		
		this.data = rows;
		this.eventType = eventType;
		this.database = new Db();
		this.flatData = {};
		
		this.data.forEach((row) => {
			this.saveCityValues(row.location.city);
		});
		
		this.data.forEach((row) => {
			this.saveEvent(row);
		});
		
	}
	
	saveCityValues (city) {

		const typeColumn = this.eventType === "checkin" ? "checkinTotal" : "reviewTotal";
		
		const query = `INSERT INTO nn_city_totals (cityName, ${typeColumn}) ` +
			`VALUES ("${city}", 1) ` +
			`ON DUPLICATE KEY UPDATE ${typeColumn} = ${typeColumn} + 1`
    ;
		
		//this.database.writePoolQueryOnly(query);
		
	}
	
	saveEvent (event) {
		
		let table = "";
		
		if (this.eventType === "checkin") {
			table = "nn_checkins_perma";
			this.flattenObject(event);
		} else if (this.eventType === "review") {
			table = "nn_reviews_perma";
			this.flattenObject(event);
		} else {return}

		const sql = `INSERT INTO ${table} SET ?`;
		
		this.database.writePool(sql,this.flatData);
		
	}
	
	flattenObject (event) {
		
		Object.entries(event).forEach(
			([key,value]) => {
				if (typeof value === "object") {
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