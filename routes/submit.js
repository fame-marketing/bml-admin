const express = require('express'),
      path = require('path'),
      router  = express.Router(),
      parse = require('csv-parse'),
      multer = require('multer'),
      storage = multer.memoryStorage(),
      fileHandler = multer({storage:storage}),
      winston = require('winston'),
      db = require('../data/Database'),
      database = new db()
;

let endMsg = "";

router.post('/', fileHandler.single('file'), function(req, res) {
	
  const eventType = req.body.type;
  const fileContents = req.file["buffer"];
  if (!fileContents) {
    endMsg = `The file was either empty or unable to be read. Check that you selected the correct file and try again.`;
    return endMsg;
  }
  parse(fileContents, {
    columns: true,
    skip_empty_lines: true
  }, function(err, output) {

    if (err) {
      winston.error(err);
      endMsg = `${err}`;
    }
    const validationCheck = validateData(output, eventType);
    if (validationCheck) {
      importEvents(output, eventType);
    } else {
      endMsg = `Data was not valid, missing columns: ${validationCheck}`;
    }

  });

  return endMsg;

});

async function importEvents(events, type) { // remember to set some sort of eventId

  let table = type === 'checkin' ? 'nn_checkins_perma' :
              type === 'reviews' ? 'nn_reviews_perma' :
              'notValid',
			sql = `INSERT INTO ${table} SET ?, eventId = id`
	;
  
  events.forEach( event => {
  	
  	const keys = Object.keys(event);
  	const values = Object.values(event);
  	let dbReadyEvent = {};
  	
  	for (let i = 0; i < keys.length; i++) {
  		dbReadyEvent[keys[i]] = values[i];
		};
	
		const written = database.writePool(sql,dbReadyEvent);
		setTimeout(function() {
			console.log(written);
		}, 7000)
  
	})

}

function validateData(eventData, eventType) {

  const expectedColumns = {
    //make createdAt and reviewRequestDate identical, make reference field NULL for import, assume Country US
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
      "CheckinImage",
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

module.exports = router;