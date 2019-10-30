const Db = require('./Database'),
  Saver = require('./saveData'),
  Builder = require('../model/Builder')
;

/*
 | base class that manages the process
*/
class cityCheck {

  constructor() {
    this.database = new Db();
    this.saver = Saver;
    this.builder = Builder;

    // grabs event data from temp tables and hands them to the saveData class for processing and storage.
    this.save("nn_checkins_temp", "checkin");
    this.save("nn_reviews_temp", "review");

    // checks the nn_city_totals db for any cities that have gained enough event data to create a page with
    this.checkCityTotals();
  }

  /*
   | async class in order to delay internal progress until the database has finished reading the data.
   | runs a query to check the temp tables for new events and passes them to the saveData class.
  */
  async save(table, eventType) {

    const sql = `SELECT * FROM ${table}`;
    const rows = await this.database.readPool(sql);

    new this.saver(rows, eventType);

  }

  /*
   | async class in order to delay internal progress until the database has finished reading the data.
   | runs a query to check if there are any eligible cities for page creation.
   | if there are any results from the query they are passed on to the Builder class.
  */
  async checkCityTotals() {

    const sql = `SELECT * FROM nn_city_totals WHERE created = 0
                AND (checkinTotal >= 5 OR
                      reviewTotal >= 1 AND checkinTotal >= 3 OR
                      reviewTotal >= 5)`
    ;

    const eligible = await this.database.readPool(sql);

    if (eligible && eligible.length !== 0) {
      await new this.builder(eligible);
    }

  }

}

module.exports = cityCheck;