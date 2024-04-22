import logger from "../bin/winston.js";
import FileUtils from "../data/FileSystem/FileUtils.js";
import fs from "fs";
import pageDbFunctionsClass from '../model/Db/pageDbFunctionsClass.js'
import pageFileFunctionsClass from '../model/FileSystem/pageFileFunctionsClass.js'

const pageDbFunctions = new pageDbFunctionsClass(),
      pageFileFunctions = new pageFileFunctionsClass();

const fileUtils = new FileUtils();

export const render = (req,res) => {

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
export const updatePages = async (req,res) => {

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
              if (pageUpdate === 'failure') logger.error('Could not update file data. city may not exist in city list file')
            }

          }

        }

        res.send('Finished updating data');

      } catch(err) {

        logger.error(err);
        res.send(err);

      }

    });

  } catch(err) {

    res.send(err);
    logger.error('There was an error while trying to scan for new pages' + err);

  }

}
