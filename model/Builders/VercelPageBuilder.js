import logger from "../../bin/winston.js";
import Database from "../../data/Database.js";
import {createReadableDate} from "../../utils/helpers.js";

/*
 | The class that handles all facets of creating new pages.
*/

export default class WpPostBuilder {

  constructor() {
    this.database = new Database()
    this.deployUrl = 'https://api.vercel.com/v1/integrations/deploy/prj_Cbw5iEKHi40V3ksebvPl2i9W174X/eyXdyZQg5M'
  }

  async triggerRebuild(eligiblePages) {

    try {
      for (const page of eligiblePages) {
        const currentDateTime = createReadableDate(new Date())

        const sql = `UPDATE nn_city_totals
                     SET Created         = 1,
                         PageCreatedDate = "${currentDateTime}"
                     WHERE City = "${page.City}"
                       AND State = "${page.State}"`;

        const setCreated = await this.database.readPool(sql);

        logger.info('set state to created result %j', setCreated)
      }

      const deployStatus = await fetch(this.deployUrl)

    } catch (err) {
      logger.error('error in Vercel triggerBuild function : %j', err)
    }
  }

}