const Db = require('./Database'),
			Saver = require('./saveData');
;

class cityCheck {

  constructor () {
    this.database = new Db();
    this.saver = Saver;
    this.fetch("nn_checkins_temp", "checkin");
    this.fetch("nn_reviews_temp", "review");
    
    this.checkCityTotals();
	}

	async fetch (table,eventType) {

    const sql = "SELECT * FROM " + table;
    const rows = await this.database.readPool(sql);
    
    new this.saver(rows,eventType);
    
  }
  
  checkCityTotals () {
  	const sql = "SELECT cityName FROM nn_city_totals WHERE total ";
  	const eligible = this.database.readPool(sql)
	}

}

module.exports = cityCheck;