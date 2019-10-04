const Db = require('./Database'),
			Saver = require('./saveData'),
      Builder = require('../model/Builder')
;

class cityCheck {

  constructor () {
    this.database = new Db();
    this.saver = Saver;
    this.builder = Builder;
    this.fetch("nn_checkins_temp", "checkin");
    this.fetch("nn_reviews_temp", "review");
    
    this.checkCityTotals();
	}

	async fetch (table,eventType) {

    const sql = "SELECT * FROM " + table;
    const rows = await this.database.readPool(sql);

    new this.saver(rows,eventType);
    
  }
  
  async checkCityTotals () {

  	const sql = `SELECT * FROM nn_city_totals WHERE
      checkinTotal >= 5 OR
      reviewTotal >= 1 AND checkinTotal >= 3 OR
      reviewTotal >= 5`
    ;

    const eligible = await this.database.readPool(sql);

    if (eligible) {
      new this.builder(eligible);
    }

	}

}

module.exports = cityCheck;