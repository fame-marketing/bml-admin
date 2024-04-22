import {parse} from "csv-parse";
import logger from "../bin/winston.js";
import Database from "../data/Database.js";
import storeRecentEvent from "../data/Db/storeRecentEvent.js";

async function importEvents(events, type) { // remember to set some sort of eventId

  let table = type === 'checkins' ? 'nn_checkins' :
    type === 'reviews' ? 'nn_reviews' :
      'notValid',
    eventType = type === 'checkins' ? 'checkin.created' : 'review.completed', //This needs to be converted due to inconsistency with how Nearby Now names things between their reports and webhooks.
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

      let dbReadyEvent = {};

      for (let i = 0; i < keys.length; i++) {
        dbReadyEvent[keys[i]] = values[i];
      }

      dbReadyEvent.eventId = dateToId(event.CheckinDateTime);
      dbReadyEvent.Country = !dbReadyEvent.Country ? 'US' : dbReadyEvent.Country;
      dbReadyEvent.CheckinDateTime = convertToReadableDate(dbReadyEvent.CheckinDateTime);

      let eventTimestamp = dbReadyEvent.CheckinDateTime;

      if (dbReadyEvent.RequestDate) {
        dbReadyEvent.RequestDate = convertToReadableDate(dbReadyEvent.RequestDate);
        dbReadyEvent.CreatedAt = convertToReadableDate(dbReadyEvent.RequestDate);
      }
      if (dbReadyEvent.ResponseDate) {
        dbReadyEvent.ResponseDate = convertToReadableDate(dbReadyEvent.ResponseDate);
        /*
         * If there is a responseDate then this is a review, thus we will use the responseDate
         * As the timestamp since that is the true date of the review.
         */
        eventTimestamp = dbReadyEvent.ResponseDate;
      }

      eventTimestamp = convertToReadableDate(eventTimestamp);

      const eventRows = await database.writePool(sql, dbReadyEvent);

      if (eventRows.affectedRows > 0) { // only save event and tally event for city if this is a new event.
        //storeRecentEvent.store(dbReadyEvent.eventId, eventTimestamp, eventType);
        //saveCityTotals(dbReadyEvent, table);
      }

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
    typeColumn = table === "nn_reviews" ? "ReviewTotal" : "CheckinTotal",
    query = `INSERT INTO nn_city_totals (city, state, ${typeColumn}) 
              VALUES ("${city}","${state}",1) 
              ON DUPLICATE KEY UPDATE ${typeColumn} = ${typeColumn} + 1`;

  database.QueryOnly(query);
}

function validateData(eventData, eventType) {

  const expectedColumns = {
    reviews: [
      "CustomerName",
      "CustomerPhone",
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

  if (
    eventColumns.every( function (column) {
      return expectedColumns[eventType].includes(column);
    })
  ) {
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

function convertToReadableDate(date) {

  function force2Digits(number) {
    return number < 10 ? '0' + number : number;
  }

  const dateObj = new Date(date * 1000);
  const dateFormat = dateObj.getFullYear() + '-' + force2Digits(dateObj.getMonth()) + '-' + force2Digits(dateObj.getDate())
  const timeFormat = force2Digits(dateObj.getHours()) + ':' + force2Digits(dateObj.getMinutes()) + ':' + force2Digits(dateObj.getSeconds())
  return dateFormat + " " + timeFormat

}

export const render = async (req,res) => {
  res.render(
    'import',
    {
      layout: 'default',
      title: 'Import Data',
      description: 'import a csv'
    }
  );
}

export const storeData = async (req,res) => {

  try {

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
        logger.error(err);
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

  } catch (e) {
    logger.error('There was an error during import : ' + e)
  }

}
