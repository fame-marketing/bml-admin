import logger from '../bin/winston.js'
import CreateWebhookEvent from '../data/CreateWebhookEvent.js'
import cityCheck from '../data/cityCheck.js'

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
