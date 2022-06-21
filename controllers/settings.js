const winston = require('../bin/winston'),
      FileUtils = require('../data/FileSystem/FileUtils'),
      pageDbFunctionsClass = require('../model/Db/pageDbFunctions'),
      pageDbFunctions = new pageDbFunctionsClass(),
      pageFileFunctionsClass = require('../model/FileSystem/PageFileFunctions'),
      pageFileFunctions = new pageFileFunctionsClass(),
      database = require('../data/Database'),
      fs = require('fs')
;

const fileUtils = new FileUtils();

exports.render = (req,res) => {

  res.render(
    'settings',
    {
      layout: 'default',
      title: 'Nearby Now Dashboard Settings',
      description: 'Nearby Now Dashboard Settings'
    }
  );

}

/*
 * Updates pages details in the database.
 * Updates page link and creation date
 *
 * */
exports.updatePages = async (req,res) => {

  try {

    const fileRoot = fileUtils.getFileRoot();

    await fs.readdir(fileRoot, {withFileTypes:true}, async (e, files) => {

      try {

        let unsavedPages = [];

        const existingPages = await pageDbFunctions.getStoredPages();

        for (let i = 0; i < files.length; i++) {

          const file = files[i];
          const fileExt = fileUtils.getExtensionName(file.name);
          const fileExtRegex = /(\.html)|(\.phtml)|(\.php)/g;

          if (
            fileExt.match(fileExtRegex) !== null &&
            !existingPages.includes(fileUtils.getFileBasename(file.name))
          ) {
            unsavedPages.push(file.name)
          } else {
            const city = await pageFileFunctions.fileNameContainsCity(file.name)
            console.log(city)
            const birthTime = fileUtils.getFileBirthtime(file.name)
            console.log(birthTime)
            if (city) {
              const pageUpdate = await pageDbFunctions.updatePageCreatedDate(city, birthTime)
              if (pageUpdate === 'failure') winston.error('Could not update file data. city may not exist in city list file')
            }

          }

        }

        res.send('Finished updating data');

      } catch(err) {

        winston.error(err);
        res.send(err);

      }

    });

  } catch(err) {

    res.send(err);
    winston.error('There was an error while trying to scan for new pages' + err);

  }

}
