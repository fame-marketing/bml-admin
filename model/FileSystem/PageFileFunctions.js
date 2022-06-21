const winston = require('../../bin/winston'),
      cityData = require('country-state-city').City,
      fileUtils = require('../../data/FileSystem/FileUtils')
;

class PageFileFunctions {

  constructor() {
    this.winston = winston
    this.states = ["GA","AL","TN","FL","SC"] // will disregard any cites that are in states not listed here. Lets make this a setting that can be adjusted.
    this.cityList = []
    this.fileUtils = new fileUtils()
  }

  async fileNameContainsCity(fileName) {

    this.states.forEach(state => {
      cityData.getCitiesOfState('US', state).map( stateObj => {
        this.cityList.push( stateObj.name.toLowerCase() )
      } )
    })

    const keyword = process.env.KEYWORDBASE.toLowerCase();
    const baseFileName = this.fileUtils.getFileBasename(fileName)

    const cityName = process.env.KeywordPosition === "post" ?
      baseFileName.replace('-' + keyword, '').replace('-', ' ') :
      baseFileName.replace(keyword + '-', '').replace('-', ' ')

    const validCity = this.isCity(cityName);

    if (validCity) {
      return cityName;
    } else {
      return false;
    }

  }

  isCity(word) {
    return this.cityList.includes(word);
  }

}

module.exports = PageFileFunctions;
