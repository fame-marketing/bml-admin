import logger from "../../bin/winston.js";
import Database from "../../data/Database.js";
import {createReadableDate} from "../../utils/helpers.js";

/*
 | The class that handles all facets of creating new pages.
*/

export default class WpPostBuilder {

  constructor(cities) {

    this.cities = cities
    this.database = new Database()
    this.KeywordPosition = process.env.NN_KEYWORD_POSITION
    this.keywordBase = process.env.NN_KEYWORD_BASE;

    this.initPageCreation();
  }

  /*
   | this function exists solely to allow the page creation process to be performed using async/await as the constructor cannot be async.
   | This function will get a list of existing service areas to check each new city against to prevent duplicates.
   | If a new city is found we will trigger the call to the WP endpoint
  */
  async initPageCreation() {

    if (this.cities.length > 0) {

      // return an array of city names
      const existingCities = await this.getExistingServiceAreas()

      for (let i = 0; i < this.cities.length; i++) {

        const city = this.cities[i]

        const cityData = this.generateSEO(city);

        if (city === undefined) {
          return;
        }

        if (!existingCities.pageSlugs.includes(cityData.seoUrl)) {
          await this.sendCityData(cityData);
        } else if (existingCities.pageSlugs.includes(cityData.seoUrl)) {
          await this.markAsCreated(existingCities.pageData, cityData.city, cityData.state)
        }
      }

    }

  }

  async getExistingServiceAreas() {
    const pageListResponse = await fetch('https://computerhelper.org/wp-json/wp/v2/service-areas')

    const pageListData = await pageListResponse.json()

    if(pageListData.length > 0) {
      const pageSlugs = pageListData.map(page => {
        return page.slug
      })

      return {
        pageSlugs : pageSlugs,
        pageData : pageListData
      }
    }

    return {
      pageSlugs : [],
      pageData: []
    }

  }

  /*
   | @city -- a string representing a city name to create the page around.
   | @pageBase -- a full html page with handlebars syntax in key locations
   | passes the city name to the generateSEO method, and compiles the pageBase using the resulting seo values.
   | once the page has been created the code is written to a file and that file stored the the location
   | indicated by the filepath variable.
  */

  async sendCityData(cityData) {

    const wpNonce = '';
    let resultMessage = '';

    const createPageResponse = await fetch('https://computerhelper.org/wp-json/fame-wp/v1/service-areas/create', {
      method: "POST",
      headers: {
        'X-WP-Nonce': wpNonce,
        'Authorization': 'Basic ' + Buffer.from('fame_dev:UXEk ECCM iWs1 eoun FLJg Gh17').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cityData)
    })

    const createPageResults = await createPageResponse.json()

    if ( "code" in createPageResults ) {
      if (createPageResults.code === "rest_missing_callback_param") {
        resultMessage = "Page Not Created: " + createPageResults.message;
      } else if (createPageResults.code === "rest_forbidden") {
        resultMessage = "Use does not have permission to create a service area."
      } else if (createPageResults.code === "rest_invalid_param") {
        resultMessage = createPageResults.message
      }
    } else if ( "ID" in createPageResults ) {
      // If there is an ID then we know that the plugin is returning the newly created page data.
      const markAsCompleteResult = await this.markAsCreated(createPageResults, cityData.city, cityData.state)
      if (!markAsCompleteResult) {
        resultMessage = 'Page was created, but we encountered an area while marking the page as created.'
      }
    } else {
      resultMessage = 'Unable to create new page. Please check for errors in in both the WP instance and this admin application.'
    }

    if (resultMessage !== '') {
      try {
        await this.addCityMessage(resultMessage, cityData.city)
      } catch (e) {
        logger.error(e)
      }

    } else {

      try {
        await this.addCityMessage('', cityData.city)
      } catch (e) {
        logger.error(e)
      }

    }

  }

  /**
   | @param cityName
   | Takes a city and updates that row in the nn_city_totals table to reflect that the page already
   | exists.
   */
  async markAsCreated(pageData, city, state) {

     try {
       const formatDate = createReadableDate(pageData.post_date);
       const query = `UPDATE nn_city_totals SET Created = 1, Url = "${pageData.guid}", PageCreatedDate = "${formatDate}" WHERE City = "${city}" AND State = "${state}"`;
       const markResults = await this.database.writePool(query);

       return typeof markResults !== 'undefined' && markResults.affectedRows > 0;
     } catch (err) {
       logger.error('Error marking city as created.');
     }

  }

  async addCityMessage(newMessage, cityName) {
    try {
      const query = `UPDATE nn_city_totals SET Messages = "${newMessage}" WHERE City = "${cityName}"`;
      this.database.QueryOnly(query);
    } catch (err) {
      logger.error('error getting file stats for the newly created file. This may prevent the database from displaying the correct page creation date for the new city.');
    }
  }

  /*
   | @city -- a string representing a city name to create the page around.
   | Creates all the dynamic content parts to be passed into the handlebars
   | template.
   | TODO: make sure to adjust the md variable below to match the client.
   */
  generateSEO(city) {

    const cityName = city.City,
      state = city.State,
      seoPhrase = this.KeywordPosition === 'pre' ?
        this.keywordBase + ' ' + cityName :
        cityName + ' ' + this.keywordBase,
      seoUrl = seoPhrase.replace(/\s|_/g, '-').toLocaleLowerCase(),
      md = "Looking for the best " + cityName + " Computer Repair? Call Computer Helper! We help individuals and small businesses with IT Support.";

    return {
      metaDescription: md,
      metaTitle: seoPhrase,
      url: seoUrl,
      pageName: cityName + ', ' + state,
      city: cityName,
      state: state
    };

  }

}