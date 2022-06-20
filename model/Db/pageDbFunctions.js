const winston = require('../../bin/winston'),
      Db = require('../../data/Database'),
      fileUtils = require('../../data/FileSystem/FileUtils')
;

class pageDbFunctions {

  constructor() {
    this.winston = winston;
    this.database = new Db();
    this.fileUtils = new fileUtils();
  }

  // @city:string - the name of a city which needs to be updated
  // @data:object - an object with keys representing the database column and value representing the new value for the city.
  async updatePageCreatedDate (city, createdDate) {

    function force2Digits(number) {
      return number < 10 ? '0' + number : number;
    }

    const dateObj = new Date(createdDate)
    const dateFormat = dateObj.getFullYear() + '-' + force2Digits(dateObj.getMonth()) + '-' + force2Digits(dateObj.getDate())
    const timeFormat = force2Digits(dateObj.getHours()) + ':' + force2Digits(dateObj.getMinutes()) + ':' + force2Digits(dateObj.getSeconds())
    const formattedCreatedDate = dateFormat + " " + timeFormat

    const sql = `UPDATE nn_city_totals SET PageCreatedDate = "${formattedCreatedDate}", Created = 1 WHERE City = "${city}"`;
    const updateResults = await this.database.writePool(sql);

    if (typeof updateResults !== 'undefined' && updateResults.affectedRows > 0) {
      return 'success'
    } else {
      return 'failure'
    }
  }

  async getStoredPages () {

    const sql = `SELECT Url FROM nn_city_totals WHERE Url IS NOT NULL`;
    const existingPages = await this.database.readPool(sql);
    return existingPages.map( UrlValue => this.fileUtils.getFileBasename(UrlValue.Url) );

  }

}

module.exports = pageDbFunctions;
