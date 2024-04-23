import Database from './Database.js'
import {saveData as Saver} from './saveData.js'
import HtmlPageBuilder from '../model/Builders/HtmlPageBuilder.js'
import WpPostBuilder from '../model/Builders/WpPostBuilder.js'

/*
 | base class that manages the process
*/
export default class cityCheck {

  constructor() {
    this.database = new Database();
    this.saver = Saver;
    this.sitePlatform = 'HTML'; //TODO: pull this from the client and use to determine which builder class to use.
    if (this.sitePlatform === 'HTML') {
      this.builder = HtmlPageBuilder;
    } else if (this.sitePlatform === 'NextJs') {
      this.builder = VercelBuilder;
    } else if (this.sitePlatform === 'Wordpress') {
      this.builder = WpPostBuilder
    }


    // grabs event data from temp tables and hands them to the saveData class for processing and storage.
    this.save();

    // checks the nn_city_totals db for any cities that have gained enough event data to create a page with
    this.checkCityTotals();
  }

  /*
   | async class in order to delay internal progress until the database has finished reading the data.
   | runs a query to check the temp tables for new events and passes them to the saveData class.
  */
  async save() {

    const sql = `SELECT * FROM nn_events_temp`;
    const rows = await this.database.readPool(sql);

    new this.saver(rows);

  }

  /*
   | async class in order to delay internal progress until the database has finished reading the data.
   | runs a query to check if there are any eligible cities for page creation.
   | if there are any results from the query they are passed on to the Builder class.
   | adjust limit variables to adjust the thresholds for creating new pages.
  */
  async checkCityTotals() {

    const checkinOnlyLimit = 5,
          reviewOnlyLimit = 5,
          checkinMixLimit = 3,
          reviewMixLimit = 1;

    const sql = `SELECT * FROM nn_city_totals WHERE Created = 0
                AND (CheckinTotal >= ${checkinOnlyLimit} OR
                      ReviewTotal >= ${reviewMixLimit} AND CheckinTotal >= ${checkinMixLimit} OR
                      ReviewTotal >= ${reviewOnlyLimit})`
    ;

    const eligible = await this.database.readPool(sql);

    if (eligible && eligible.length !== 0) {
      await new this.builder(eligible);
    }

  }

}