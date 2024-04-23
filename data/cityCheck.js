import Database from './Database.js'
import {saveData as Saver} from './saveData.js'
import HtmlPageBuilder from '../model/Builders/HtmlPageBuilder.js'
import WpPostBuilder from '../model/Builders/WpPostBuilder.js'
import logger from "../bin/winston.js";

/*
 | base class that manages the process
*/
export default class cityCheck {

  constructor() {
    this.database = new Database();
    this.saver = Saver;
    this.sitePlatform = 'Wordpress'; //TODO: pull this from the client and use to determine which builder class to use.

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

    const checkinLimit = 1,
          reviewLimit = 1;

    const sql = `SELECT * FROM nn_city_totals WHERE Created = 0
                AND (CheckinTotal >= ${checkinLimit} OR
                      ReviewTotal >= ${reviewLimit})`
    ;

    const eligible = await this.database.readPool(sql);

    if (eligible && eligible.length !== 0) {
      if (this.sitePlatform === 'HTML') {
        new HtmlPageBuilder(eligible);
      } else if (this.sitePlatform === 'NextJs') {
        new VercelBuilder(eligible);
      } else if (this.sitePlatform === 'Wordpress') {
        new WpPostBuilder(eligible)
      }
    }

  }

}