import logger from "../../bin/winston.js";
import Database from "../../data/Database.js";
import {createReadableDate} from "../../utils/helpers.js"

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

      this.cities.forEach((city) => {

        // get seo data now so we can compare the seoUrl to existing url's from WordPress
        const cityData = this.generateSEO(city);

        if (city !== undefined && existingCities.includes(cityData.seoUrl)) {
          this.sendCityData(cityData);
        }

      });

    }

  }

  async getExistingServiceAreas() {
    const pageListResponse = await fetch('https://fameinternet.com/~famewptest/wp-json/wp/v2/posts')

    const pageListData = await pageListResponse.json()

    const pageCities = pageListData.map(page => {
      return page.slug
    })

    return pageCities
  }

  /*
   | @city -- a string representing a city name to create the page around.
   | @pageBase -- a full html page with handlebars syntax in key locations
   | passes the city name to the generateSEO method, and compiles the pageBase using the resulting seo values.
   | once the page has been created the code is written to a file and that file stored the the location
   | indicated by the filepath variable.
  */

  async sendCityData(city) {

    const createPageResponse = await fetch('https://fameinternet.com/~famewptest/wp-json/wp/v2/posts', {
      method: "POST",
      headers: '',
      body:
    })
    //TODO : send the generated SEO data to Wordpress

  }

  /**
   | @param cityName
   | Takes a city and updates that row in the nn_city_totals table to reflect that the page already
   | exists.
   */
  async markAsCreated() {

   // We will try to use data from Wordpress to set update/set the page creation status and date in the database.

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
      md = "[Client Name] provides quality, timely, and affordable services. For " + cityName + " HVAC, contact us today.";
    return {
      metaDescription: md,
      metaTitle: seoPhrase,
      url: seoUrl,
      pageName: cityName,
      keyword: seoPhrase,
      city: cityName,
      state: state
    };

  }

}