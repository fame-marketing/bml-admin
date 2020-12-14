const express = require('express'),
      router  = express.Router(),
      winston = require('../bin/winston'),
      FileUtils = require('../data/FileSystem/FileUtils'),
      pageDbFunctionsClass = require('../model/Db/pageDbFunctions'),
      pageDbFunctions = new pageDbFunctionsClass();
      pageFileFunctionsClass = require('../model/FileSystem/PageFileFunctions'),
      pageFileFunctions = new pageFileFunctionsClass();
      database = require('../data/Database'),
      db = new database(),
      fs = require('fs')
;

router.get('/', function(req, res) {
  res.render(
    'settings',
    {
      layout: 'default',
      title: 'Nearby Now Dashboard Settings',
      description: 'Nearby Now Dashboard Settings'
    }
  );
});

router.post('/', async (req, res) => {

  const fileUtils = new FileUtils();

  if (req.body.scan === "true") {

    try {

      const fileRoot = fileUtils.getFileRoot();

      await fs.readdir(fileRoot, {withFileTypes:true}, async (e, files) => {

        try {

          let unsavedPages = [];

          for (let i = 0; i < files.length; i++) {

            const file = files[i];
            const fileExt = fileUtils.getExtensionName(file.name);
            const fileExtRegex = /(\.html)|(\.phtml)|(\.php)/g;
            const existingPages = await getStoredPages();

            if (
              fileExt.match(fileExtRegex) &&
              !existingPages.includes(fileUtils.getFileBasename(file.name))
            ) {
              const city = getCityFromFileName(file.name);
              unsavedPages.push(file.name) ;
            }
          }

          function getCityFromFileName(fileName) { //move to dedicated file after this works
            pageFileFunctions.fileNameContainsCity(fileName);
          }

          res.send(pageFileFunctions.getAllCities());

        } catch(err) {

          winston.error(err);
          res.send(err);

        }

      });

    } catch(err) {

      winston.error('There was an error while trying to scan for new pages' + err);

    }

  }
});

async function getStoredPages () {

  const sql = `SELECT Url FROM nn_city_totals WHERE Url IS NOT NULL`;
  const existingPages = await db.readPool(sql);
  return existingPages.map( UrlValue => UrlValue.Url );

}

async function addNewPages(pageList) {

  const values = pageList;
  const sql = `INSERT INTO nn_city_totals (City, State, Url, CheckinTotal, ReviewTotal, Created, PageCreatedDate, Verified) VALUES ?`;

}

module.exports = router;
