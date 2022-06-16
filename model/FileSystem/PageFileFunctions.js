const winston = require('../../bin/winston'),
      csc = require('country-state-city').default,
      fs = require('fs'),
      createFile = require('./CreateLimitedCityNameFile')
;

class PageFileFunctions {

  constructor() {
    this.winston = winston;
    this.states = ["GA","AL","TN","FL","SC"]; // will disregard any cites that are in states not listed here. Lets make this a setting that can be adjusted.
    this.countryCode = csc.getCountryByCode('US');
    this.fs = fs;
    this.cityFilePath = './bin/geonames-cities-1000.geojson';

    this.cityList = this.fs.readFile(this.cityFilePath, (err,data) => {

      if (err) throw err;

      const parsedData = JSON.parse(data);

      const relevantCities = parsedData.features.filter( (city) => {
        if (this.states.includes(city.properties["admin1_code"])) {
          return city.properties['name'];
        }
      })

      return parsedData;

    });
  }

  fileNameContainsCity(fileName) {
    const wordList = fileName.split("-");
    wordList.forEach(word => {
      this.isCity(word);
    })
  }

  getAllCities() {
    return this.cityList;
  }

  isCity(word) {
    return this.cityList.includes(word);
  }

}

module.exports = PageFileFunctions;
