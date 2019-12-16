const express = require('express'),
      path = require('path'),
      router  = express.Router(),
      parse = require('csv-parse'),
      multer = require('multer'),
      storage = multer.memoryStorage(),
      fileHandler = multer({storage:storage}),
      winston = require('../bin/winston'),
      db = require('../data/Database'),
      database = new db()
;

router.post('/', fileHandler.single('file'), function(req, res) {

  let endMsg = "";
  const eventType = req.body.type;
  const fileContents = req.file["buffer"];

  if (!fileContents) {
    endMsg = `The file was either empty or unable to be read. Check that you selected the correct file and try again.`;
  }

  parse(fileContents, {
    columns: true,
    skip_empty_lines: true
  }, async function(err, output) {

    if (err) {
      winston.error(err);
      endMsg = `${err}`;
    }

    const validationCheck = await validateData(output, eventType);
    
    if (validationCheck === true) {
      const importResult = await importEvents(output, eventType);
      if (importResult === 'notValid') {
        endMsg = "The event type is invalid. Make sure that you selected an import type";
      } else {
        endMsg = `Import Successful! ${importResult} rows have been imported`;
      }
    } else {
      endMsg = `Data was not valid, missing columns: ${validationCheck}`;
    }

    res.send(endMsg);

  });

});

async function importEvents(events, type) { // remember to set some sort of eventId

  let table = type === 'checkins' ? 'nn_checkins_perma' :
              type === 'reviews' ? 'nn_reviews_perma' :
              'notValid',
			sql = `INSERT IGNORE INTO ${table} SET ?`
	;

  if (table === 'notValid') return table;
  
  const importedData = async () => {
  	return await Promise.all(events.map( async event => {

      const keys = Object.keys(event),
            LatI = keys.indexOf('Lat'),
            LongI = keys.indexOf('Long'),
            values = Object.values(event);

      keys.splice(LatI, 1, "Latitude");
      keys.splice(LongI, 1, "Longitude");

      if (keys.includes('RequestDate')) {
        const rdI = keys.indexOf('RequestDate');
        keys.splice(rdI, 1, "CreatedAt");
      }

      let dbReadyEvent = {};
			
				for (let i = 0; i < keys.length; i++) {
					dbReadyEvent[keys[i]] = values[i];
				}
				
				dbReadyEvent.eventId = dateToId(event.CheckinDateTime);
				dbReadyEvent.Country = !dbReadyEvent.Country ? 'US' : dbReadyEvent.Country;
				if (dbReadyEvent.CheckinDateTime) {
					dbReadyEvent.CheckinDateTime = new Date(dbReadyEvent.CheckinDateTime);
				}
				if (dbReadyEvent.CreatedAt) { // assign the RequestDate value to the Created DB column.
					dbReadyEvent.CreatedAt = new Date(dbReadyEvent.CreatedAt);
				}
				if (dbReadyEvent.ResponseDate) {
					dbReadyEvent.ResponseDate = new Date(dbReadyEvent.ResponseDate);
				}

				const eventRows = await database.writePool(sql, dbReadyEvent);
				saveCityTotals(dbReadyEvent, table);
				return eventRows.affectedRows;

		}))
	};
  
  const importedArray = await importedData();
  
  if(Array.isArray(importedArray)) {
		const totalImported = importedArray.reduce((total,current) => {
			return total + current;
		},0);
		return totalImported;
	} else {
		return importedArray;
	}
}

function saveCityTotals(event, table) {

	const city = event.City,
		state = event.State,
		typeColumn = table === "nn_reviews_perma" ? "ReviewTotal" : "CheckinTotal",
		query = `INSERT INTO nn_city_totals (city, state, ${typeColumn}) 
              VALUES ("${city}","${state}",1) 
              ON DUPLICATE KEY UPDATE ${typeColumn} = ${typeColumn} + 1`;

  database.QueryOnly(query);
}

function validateData(eventData, eventType) {
	
  const expectedColumns = {
    reviews: [
      "CustomerName",
      "CustomerEmail",
      "ResponseDate",
      "ReviewRating",
      "ReviewSummary",
      "ReviewDetail",
      "RequestDate",
      "UserEmail",
      "UserName",
      "CheckinDateTime",
      "Lat",
      "Long",
      "CheckinImageUrl",
      "Street",
      "City",
      "State",
      "PostalCode"
    ],
    checkins: [
      "UserEmail",
      "UserName",
      "CheckinDateTime",
      "Reference",
      "Street",
      "City",
      "State",
      "PostalCode",
      "Lat",
      "Long",
      "CheckinImageUrl"
    ]
  };

  const eventColumns = Object.keys(eventData[0]);

  if (JSON.stringify(eventColumns) === JSON.stringify(expectedColumns[eventType])) {
    return true;
  } else {
    return expectedColumns[eventType].reduce( (missing, column) => {
      if (!eventColumns.includes(column)) {
        missing.push(column);
      }
      return missing;
    }, []);
  }

}

function dateToId(date) {
  return new Date(date).getTime() / 1000;
}

module.exports = router;