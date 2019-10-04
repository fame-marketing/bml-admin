const fs = require('fs'),
      util = require('util'),
      path = require('path'),
      handlebars = require('handlebars')
;

class Builder {

  constructor (cities) {
    this.filesystem = fs;
    this.promiseReader = util.promisify(fs.readFile);
    this.path = path;
    this.cities = cities;
    this.destination = process.env.DESTINATION; //directory where the page will be placed upon creation
    this.initPageCreation();
  }

  async initPageCreation () {

    const pageBase = await this.fetchFileBase();

    this.cities.forEach((city) => {
      this.createPage(city,pageBase);
    });

  }
  
  createPage (city,pageBase) {

  	const seo = this.generateSEO(city);
    const content = this.generateContent(pageBase,seo);

  	/*this.filesystem.appendFile(seo.url,content, (e) => {
  	  console.log("there was an error while attempting to create the file: " + e);
    });*/
	}

  generateContent (pageBase, seo) {
    /*
     * will take the content base and the seo and merge them to create a complete base.
     */
  }

  async fetchFileBase () {

    try {
      return await this.promiseReader('views/nearbynow.hbs', 'utf8');
    } catch (err) {
      console.log(err);
    }

  }

  generateSEO (city) {

    console.log(city);

    const cityName = city.city,
          state = city.state
    ;

    return {
      metaDescription: process.env.KEYWORD + " repair in" + cityName,
      metaTitle: process.env.KEYWORD + "repair in" + cityName,
      url: process.env.KEYWORD + ".phtml",
      pageName: "page name in " + process.env.KEYWORD,
      keyword: process.env.KEYWORD,
      state: cityName,
      state: state
    };
  }

}

module.exports = Builder;