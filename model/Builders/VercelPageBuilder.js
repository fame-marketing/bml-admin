import logger from "../../bin/winston.js";
import Database from "../../data/Database.js";
import {createReadableDate} from "../../utils/helpers.js";

/*
 | The class that handles creating NearbyNow pages for NextJS/Vercel projects.
*/

export default class VercelPageBuilder {

  constructor(cities) {
    this.cities = cities;
    this.database = new Database();
    this.KeywordPosition = process.env.NN_KEYWORD_POSITION;
    this.keywordBase = process.env.NN_KEYWORD_BASE;
    this.vercelApiUrl = process.env.VERCEL_API_URL || 'https://api.vercel.com';
    this.vercelApiToken = process.env.VERCEL_API_TOKEN;
    this.vercelProjectId = process.env.VERCEL_PROJECT_ID;
    this.deployUrl = process.env.VERCEL_DEPLOY_HOOK || 'https://api.vercel.com/v1/integrations/deploy/prj_Cbw5iEKHi40V3ksebvPl2i9W174X/eyXdyZQg5M';

    this.initPageCreation();
  }

  /*
   This function allows the page creation process to be performed using async/await
   It will process each city and send the data to Vercel
  */
  async initPageCreation() {
    if (this.cities.length > 0) {
      // Process each city
      for (let i = 0; i < this.cities.length; i++) {
        const city = this.cities[i];
        
        if (city === undefined) {
          continue;
        }
        
        const cityData = this.generateSEO(city);
        
        // Send the city data to Vercel
        await this.sendCityData(cityData);
      }

      // After processing all cities, trigger a rebuild to ensure changes are deployed
      await this.triggerRebuild();
    }
  }

  /*
   Sends city data to the Vercel API endpoint
   This will trigger the creation of a new page in the Vercel project
  */
  async sendCityData(cityData) {
    try {
      // If we have a specific API endpoint for sending city data
      if (this.vercelApiUrl && this.vercelApiToken && this.vercelProjectId) {
        // Call the Vercel API endpoint
        const response = await fetch(`${this.vercelApiUrl}/api/nearbynow-pages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.vercelApiToken}`
          },
          body: JSON.stringify({
            projectId: this.vercelProjectId,
            cityData: cityData
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          // Mark the city as created in our database
          await this.markAsCreated(result, cityData.city, cityData.state);
          logger.info(`Successfully created NearbyNow page for ${cityData.city}, ${cityData.state} in Vercel project`);
        } else {
          // Log the error
          const errorMessage = `Failed to create NearbyNow page for ${cityData.city}: ${result.message || 'Unknown error'}`;
          await this.addCityMessage(errorMessage, cityData.city);
          logger.error(errorMessage);
        }
      } else {
        // If we don't have API credentials, just mark the city as created
        // This is a fallback for local development
        const mockResult = {
          url: `/service-areas/${cityData.seoUrl}`
        };
        await this.markAsCreated(mockResult, cityData.city, cityData.state);
        logger.info(`Marked NearbyNow page for ${cityData.city}, ${cityData.state} as created (local development mode)`);
      }
    } catch (error) {
      const errorMessage = `Error creating NearbyNow page for ${cityData.city}: ${error.message}`;
      await this.addCityMessage(errorMessage, cityData.city);
      logger.error(errorMessage);
    }
  }

  /**
   * Triggers a rebuild of the Vercel project
   */
  async triggerRebuild() {
    try {
      logger.info('Triggering Vercel rebuild...');
      const deployStatus = await fetch(this.deployUrl);
      logger.info('Vercel rebuild triggered, status: ' + deployStatus.status);
      return deployStatus.ok;
    } catch (err) {
      logger.error('Error in Vercel triggerRebuild function: %j', err);
      return false;
    }
  }

  /**
   * Takes a city and updates that row in the nn_city_totals table to reflect that the page already exists.
   */
  async markAsCreated(pageData, city, state) {
    try {
      const formatDate = createReadableDate(new Date());
      const query = `UPDATE nn_city_totals SET Created = 1, Url = "${pageData.url}", PageCreatedDate = "${formatDate}" WHERE City = "${city}" AND State = "${state}"`;
      const markResults = await this.database.readPool(query);

      return typeof markResults !== 'undefined' && markResults.affectedRows > 0;
    } catch (err) {
      logger.error('Error marking city as created: ' + err);
      return false;
    }
  }

  async addCityMessage(newMessage, cityName) {
    try {
      const query = `UPDATE nn_city_totals SET Messages = "${newMessage}" WHERE City = "${cityName}"`;
      await this.database.QueryOnly(query);
    } catch (err) {
      logger.error('Error adding city message: ' + err);
    }
  }

  /*
   Creates all the dynamic content parts to be passed to the Vercel API
   */
  generateSEO(city) {
    const cityName = city.City,
      state = city.State,
      seoPhrase = this.KeywordPosition === 'pre' ?
        this.keywordBase + ' ' + cityName :
        cityName + ' ' + this.keywordBase,
      seoUrl = seoPhrase.replace(/\s|_/g, '-').toLocaleLowerCase(),
      md = `${cityName} Building Suppliers offering a high-quality in-stock and special order doors, windows, trim & moulding for builders throughout West Georgia.`;

    return {
      metaDescription: md,
      metaTitle: `${cityName} Building Suppliers - Building Material Liquidation`,
      seoUrl: seoUrl,
      pageName: cityName + ', ' + state,
      city: cityName,
      state: state,
      description: `${cityName} Building Suppliers offering a high-quality in-stock and special order doors, windows, trim & moulding for builders throughout West Georgia.`
    };
  }
}