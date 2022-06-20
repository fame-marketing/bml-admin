const winston = require('../../bin/winston'),
      csc = require('country-state-city').default,
      fs = require('fs'),
      util = require('util'),
      createFile = require('./CreateLimitedCityNameFile')
      fileUtils = require('../../data/FileSystem/FileUtils')
;

class PageFileFunctions {

  constructor() {
    this.winston = winston
    this.states = ["GA","AL","TN","FL","SC"] // will disregard any cites that are in states not listed here. Lets make this a setting that can be adjusted.
    this.countryCode = csc.getCountryByCode('US')
    this.fs = fs
    this.promiseReader = util.promisify(fs.readFile);
    this.cityFilePath = './bin/geonames-cities-1000.geojson'
    this.cityList = []
    this.fileUtils = new fileUtils()
  }

  async fileNameContainsCity(fileName) {

    this.cityList = await this.getAllCities()

    const baseFileName = this.fileUtils.getFileBasename(fileName)

    const wordList = baseFileName.split("-")

    let foundWord = false
    let i = 0

    do {
      const wordIsCity = this.isCity(wordList[i])
      if (wordIsCity) foundWord = true
      i++
    } while (foundWord === false && wordList.length < i);

    if (foundWord) {
      return wordList[i - 1];
    } else {
      return false;
    }

  }

  async getAllCities() {

    let relevantCities = []

    const fileContents = await this.promiseReader(this.cityFilePath).then(data => {

      const parsedData = JSON.parse(data);

      relevantCities = parsedData.features.map( (city) => {
        if (this.states.includes(city.properties["admin1_code"])) {
          return city.properties['name'].toLowerCase();
        }
      })
    }).catch(err => {
      throw err
    })

    return relevantCities.filter(city => {
      return city !== undefined
    });
  }

  isCity(word) {
    return this.cityList.includes(word);
  }

}

module.exports = PageFileFunctions;
