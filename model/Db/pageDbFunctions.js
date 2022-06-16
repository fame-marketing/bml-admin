const winston = require('../../bin/winston'),
      Db = require('../../data/Database')
;

class pageDbFunctions {

  // takes an array of file names for database updates
  // @array cities
  constructor() {
    this.winston = winston;
    this.database = new Db();
  }

  // could probably use a better name, but the purpose of this method is to take a file name which refers
  // to an page with nearby now content on it and check to see if a city for that page exists already in the
  // databse. If a city is already in the city_totals table then the next step is to check if that city has
  // a Url assigned to it. If there is already a Url assigned to it, then we need to check if that city is marked
  // as Created.
  updateCityDatabase(cities) {

    try {

      winston.info('the cities are %j',cities);

      const dbSearchResults = Promise.all( cities.map( async city => {
        const sql = `INSERT INTO nn_city_totals (City, Created) VALUES ("${city}", 1) ON DUPLICATE KEY UPDATE Url = "${city}", Created = 1`;
        const updateResults = await this.database.writePool(sql);
        return updateResults;
      }));

      return dbSearchResults;

    } catch(err) {
      winston.error(err);
    }

  }

}

module.exports = pageDbFunctions;
