import logger from '../bin/winston.js'
import CreateWebhookEvent from '../data/CreateWebhookEvent.js'
import cityCheck from '../data/cityCheck.js'
import Database from '../data/Database.js'
import VercelPageBuilder from '../model/Builders/VercelPageBuilder.js'

/*
 | @request -- the body of the request that called this file. This should contain the NearbyNow event data.
 | Decides which type of event the request is and passes the event and request type to the Create class
 | to store the data in the temp tables.
*/
async function storeData(request) {

  try {

    const requestType = (request["type"] === "checkin.created") ? 'checkin' :
      (request["type"] === "review.completed") ? 'review' :
        'invalid';

    if (requestType !== "invalid") {
      new CreateWebhookEvent(request)
    }

  } catch(e) {
    logger.error(e);
  }

}

/*
 | @data - an object containing the page request data.
 | checks to make sure the request is valid returning true if so.
*/
function processRequest(data) {

  const accountKey = process.env.NN_API_TOKEN;

  if (data.headers["x-account-key"] !== accountKey) {
    return "incorrectKey";
  } else if (Object.entries(data.body).length === 0) {
    return "emptyRequest";
  } else {
    return true;
  }

}

export const storeEvent = async (req,res,next) => {

  // Takes the request body and checks to make sure that it is valid. throws an error if not.
  await (() => {
    try {
      let valid = processRequest(req);
      if (valid === true) {
        res.status(200).end();
        storeData(req.body).then();
      } else {
        logger.error(`There was an error: ${valid}`);
        res.status(500).end();
      }
    } catch (error) {
      next(error);
    }
  })();

}

export const testWordpress = async (req,res,next) => {
  new cityCheck()
}

export const vercelEndpoint = async (req, res, next) => {
  try {
    // Validate the request
    const valid = processRequest(req);
    if (valid !== true) {
      logger.error(`Invalid request to Vercel endpoint: ${valid}`);
      return res.status(400).json({ error: valid });
    }

    // Store the event data if it's a webhook event
    if (req.body.type) {
      await storeData(req.body);
    }

    // Get eligible cities from the database
    const database = new Database();
    const checkinLimit = 1;
    const reviewLimit = 1;
    
    const sql = `SELECT * FROM nn_city_totals WHERE Created = 0
                AND (CheckinTotal >= ${checkinLimit} OR
                      ReviewTotal >= ${reviewLimit})`;
    
    const eligible = await database.readPool(sql);

    // If there are eligible cities, create pages for them using the VercelPageBuilder
    if (eligible && eligible.length !== 0) {
      // Create pages using the VercelPageBuilder
      new VercelPageBuilder(eligible);
      
      // Return success response with the eligible cities
      return res.status(200).json({ 
        success: true, 
        message: `Processing ${eligible.length} eligible cities for Vercel project`,
        cities: eligible.map(city => `${city.City}, ${city.State}`)
      });
    }

    // If no eligible cities, return success but with a message
    return res.status(200).json({ 
      success: true, 
      message: 'No eligible cities found for page creation'
    });
    
  } catch (error) {
    logger.error(`Error in Vercel endpoint: ${error.message}`);
    next(error);
  }
}
