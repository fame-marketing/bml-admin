const fs = require('fs'),
			util = require('util'),
			path = require('path'),
			handlebars = require('handlebars'),
			winston = require('../bin/winston'),
			os = require('os'),
			Db = require('../data/Database')
;

/*
 | The class that handles all facets of creating new pages.
*/

class Builder {

  constructor(cities) {
    this.filesystem = fs;
    this.os = os;
    this.promiseReader = util.promisify(fs.readFile);
    this.path = path;
    this.cities = cities;
    this.handlebars = handlebars;
    this.database = new Db();
    this.destination = process.env.DESTINATION; //directory where the page will be placed upon creation
    this.KeywordPosition = process.env.KeywordPosition;
    this.initPageCreation();
  }

  /*
   | this function exists solely to allow the page creation process to be performed using async/await as the constructor cannot be async.
   | grabs the handlebars filled html page base then iterates over the cities list passed to the parent class
   | and passes each one to the createPage method.
  */
  async initPageCreation() {

    const pageBase = await this.fetchFileBase();
    
    this.cities.forEach((city) => {
      this.createPage(city, pageBase);
    });

  }

  /*
   | @city -- a string representing a city name to create the page around.
   | @pageBase -- a full html page with handlebars syntax in key locations
   | passes the city name to the generateSEO method, and compiles the pageBase using the resulting seo values.
   | once the page has been created the code is written to a file and that file stored the the location
   | indicated by the filepath variable.
  */

  createPage(city, pageBase) {
  	
    const seo = this.generateSEO(city),
      template = this.handlebars.compile(pageBase),
      dpath = this.fixSlashes(this.destination),
      filepath = os.homedir() + '/public_html/' + dpath + '/' + seo.url + '.phtml',
      fileDir = os.homedir() + '/public_html/' + dpath + '/'
    ;

    let page = template(seo);

    /*
     | This writefile method will handle creating the seo page.
     | Node documentation - https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
     | flags wx tell the method not to try to create the file if it exists already
     | If there is an missing directory leading up to the destination, the method will
     | attempt to create the missing directory.
    */
    this.filesystem.writeFile(filepath, page, {flag:'wx'}, (e) => {

      if(e) {

        if (e.code === 'ENOENT') {
          this.filesystem.mkdirSync(fileDir, {recursive:true},(e) => {
            if (e) throw e;
          });
          winston.info("The directory did not exist, it has been created. The file will be generated on the next cron run.");
        } else {
          winston.error("there was an error while attempting to create the file: " + e);
        }

      } else {

        winston.info('page created succesfully');
        const sql = `UPDATE nn_city_totals SET created = 1 WHERE city = "${city.City}"`;
        this.database.QueryOnly(sql);

      }

    });
  }

  /*
   | grabs the handlebars file contents and returns them
  */
  async fetchFileBase() {

    try {
      return await this.promiseReader('views/nearbynow.hbs', 'utf8');
    } catch (err) {
      winston.error(err);
    }

  }

  /*
   | @city -- a string representing a city name to create the page around.
   | Creates all the dynamic content parts to be passed into the handlebars
   | template.
  */
  generateSEO(city) {

    const cityName = city.City,
          state = city.State,
          seoPhrase = this.KeywordPosition === 'pre' ?
            process.env.KEYWORDBASE + ' ' + cityName :
            cityName + ' ' + process.env.KEYWORDBASE,
          seoUrl = seoPhrase.replace(/\s|_/g, '-').toLocaleLowerCase();
    return {
      metaDescription: seoPhrase,
      metaTitle: seoPhrase,
      url: seoUrl,
      pageName: cityName,
      keyword: seoPhrase,
      city: cityName,
      state: state
    };

  }

  fixSlashes(path) {
    if (path.endsWith('/')) {
      path = path.slice(0,-1)
    }
    if (path.startsWith('/')) {
      path = path.slice(1)
    }
    return path;
  }

}

module.exports = Builder;