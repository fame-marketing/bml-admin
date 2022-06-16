const fs = require('fs'),
  util = require('util'),
  handlebars = require('handlebars'),
  winston = require('../bin/winston'),
  os = require('os'),
  Db = require('../data/Database'),
  fileUtils = require('../data/FileSystem/FileUtils'),
  SitemapGenerator = require('../bin/Generate')
;

/*
 | The class that handles all facets of creating new pages.
*/

class Builder {

  constructor(cities) {
    this.filesystem = fs;
    this.os = os;
    this.promiseReader = util.promisify(fs.readFile);
    this.cities = cities;
    this.handlebars = handlebars;
    this.database = new Db();
    this.KeywordPosition = process.env.KeywordPosition;
    this.keywordBase = process.env.KEYWORDBASE;
    this.sitemapGenerator = SitemapGenerator;
    this.fileUtils = new fileUtils();

    this.dPath = this.fileUtils.fixSlashes(process.env.DESTINATION);
    this.fileDir = this.os.homedir() + '/public_html/' + this.dPath + '/';

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
      if (city !== undefined) {
        this.checkExisting(city, pageBase);
      }
    });

  }

  /*
   | Checks if a file exists in the destination folder that contains the city name in it.
   | This is mainly to check if, before this nn automation program was added to the site,
   | a page was created manually for the city in question.
  */
  async checkExisting(city, base) {

    const checkCity = city.City;

    await this.filesystem.readdir(this.fileDir, async (e,files) => {

      if(e) {

        winston.error('Could not read the destination directory: ' + e);

      } else {

        try {
          const checkCityFormatted = checkCity.toLowerCase().replace(' ', '-');
          const cityExists = files.filter(file => file.includes(checkCityFormatted));
          if (cityExists.length !== 0) {
            const filePath = this.fileDir + '/' + cityExists[0];
            this.markAsCreated(checkCity, cityExists[0], filePath);
            winston.info('attempted to create a page for the city ' + checkCity + ' that is already represented by the file(s) ' + cityExists.toString());
          }else if(cityExists.length === 0) {
            this.createPage(city, base);
          }
        } catch (err) {
          winston.error(err);
        }

      }
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
          filepath = this.fileDir + seo.url + '.phtml'
    ;

    let page = template(seo);

    /*
     | This writefile method will handle creating the seo page.
     | Node documentation - https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
     | flags wx tell the method not to try to create the file if it exists already
     | If there is an missing directory leading up to the destination, the method will
     | attempt to create the missing directory.
    */
    this.filesystem.writeFile(filepath, page, {flag:'wx'}, async (e) => {

      if(e) {
        console.log(e);
        if (e.code === 'ENOENT') {
          this.filesystem.mkdirSync(this.fileDir, {recursive:true},(e) => {
            if (e) throw e;
          });
          winston.info("The directory " + this.fileDir + " did not exist, it has been created. The file will be generated on the next cron run.");
        } else {
          winston.error("there was an error while attempting to create the file: " + e);
        }

      } else {

        winston.info(city.City + ' page created succesfully.');
        this.markAsCreated(city.City, seo.url, filepath).catch(() => {});
        const sitemap = this.os.homedir() + '/public_html/service-areas-sitemap.xml';
        await new this.sitemapGenerator(sitemap, seo.url);

      }

    });
  }

  /**
   | @param cityName
   | Takes a city and updates that row in the nn_city_totals table to reflect that the page already
   | exists.
   */
  async markAsCreated(cityName, url, createdFile) {

    await fs.stat(createdFile, (err, stats) => {
      try {
        const birthtime = stats.birthtime;
        const date = birthtime.toLocaleString('en-GB');
        const formatDate = date.substring(0, 10).split('/').reverse().join('/') + ' ' + date.substring(12,20)
        const query = `UPDATE nn_city_totals SET created = 1, Url = "${url}", PageCreatedDate = "${formatDate}" WHERE city = "${cityName}"`;
        this.database.QueryOnly(query);
      } catch (err) {
        winston.error('error getting file stats for the newly created file. This may prevent the database from displaying the correct page creation date for the new city.');
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
   | TODO: make sure to adjust the md variable below to match the client.
   */
  generateSEO(city) {

    const cityName = city.City,
      state = city.State,
      seoPhrase = this.KeywordPosition === 'pre' ?
        this.keywordBase + ' ' + cityName :
        cityName + ' ' + this.keywordBase,
      seoUrl = seoPhrase.replace(/\s|_/g, '-').toLocaleLowerCase(),
      md = "Comfort Solutions Heating and Cooling provides quality, timely, and affordable services. For " + cityName + " HVAC, contact us today.";
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

module.exports = Builder;
