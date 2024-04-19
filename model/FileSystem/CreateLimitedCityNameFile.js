const winston = require('../../bin/winston'),
      fs = require('fs')
;

class CreateLimitedCityNameFile {

  constructor(states) {

    this.ogFile = './bin/geonames-cities-1000.geojson';
    this.statesList = states;

  }

  generateCitySpecificFile() {

    const citiesArray = this.fs.readFile(this.ogFile, (err,data) => {

      if (err) throw err;

      const parsedData = JSON.parse(data);
      let citiesOnly = [];

      parsedData.features.forEach((feature) => {
        if (this.statesList.includes(feature.properties["admin1_code"])) {
          citiesOnly.push({
            "state": feature.properties["admin1_code"],
            "name": feature.properties["name"],
            "coordinates" : feature.properties["coordinates"],
          })
        }
      })

      return citiesOnly;

    });

    const newFileOptions = {
      mode:'0o755',
      emitClose:true
    };

    const newFile = this.fs.createWriteStream('./bin/cityList.json', newFileOptions);

    newFile.write(citiesArray);

    newFile.end(()=>{
      logger.info('The new city list file has been created successfully');
    });

  }

}

module.exports = CreateLimitedCityNameFile;
