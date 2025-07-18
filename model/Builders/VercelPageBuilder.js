import Database from "../../data/Database.js";
import logger from "../../bin/winston.js";
import { simplifyDateFormat } from "../../utils/helpers.js";

export default class Vercel {

  constructor() {
    this.database = new Database();
    this.deployUrl = process.env.VERCEL_DEPLOY_HOOK || 'https://api.vercel.com/v1/integrations/deploy/prj_Cbw5iEKHi40V3ksebvPl2i9W174X/eyXdyZQg5M';
  }

  async triggerRebuild(eligiblePages) {
    try {
      // Update database records for each eligible page
      for (const page of eligiblePages) {
        const currentDateTime = simplifyDateFormat(new Date());

        const sql = `UPDATE nn_city_totals
                     SET Created         = 1,
                         PageCreatedDate = "${currentDateTime}"
                     WHERE City = "${page.City}"
                       AND State = "${page.State}"`;

        const setCreated = await this.database.readPool(sql);
        logger.info('Set state to created result %j', setCreated);
      }

      // Trigger Vercel rebuild using the deploy hook
      logger.info('Triggering Vercel rebuild...');
      const deployStatus = await fetch(this.deployUrl);
      logger.info('Vercel rebuild triggered, status: ' + deployStatus.status);

      return deployStatus.ok;
    } catch (err) {
      logger.error('Error in Vercel triggerRebuild function: %j', err);
      return false;
    }
  }
}