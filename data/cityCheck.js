const Db = require('./Database');

class cityCheck {

  constructor () {
    this.database = new Db();
    this.fetch("nn_checkins");
    this.fetch("nn_reviews");
	}

	fetch (table) {

    const sql = "SELECT * FROM " + table;
    this.database.readPool(sql);

  }

}

module.exports = cityCheck;