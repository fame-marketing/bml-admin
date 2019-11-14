const express = require('express'),
      path = require('path'),
      router  = express.Router(),
      winston = require('../bin/winston'),
      AddProcessor = require('../data/Create')
;
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Nearby Now Webhook',description: 'There is nothing of value here. This route can probably just be removed'});
});

router.get('/webhook', function(req, res) {
  res.render('index', { title: 'Nearby Now Webhooks Data',description: 'Nearby Now Data for Fame Marketing'});
});

router.post('/webhook', async (req, res, next) => {

  // Takes the request body and checks to make sure that it is valid. throws an error if not.
  await (() => {
    try {
      let valid = processRequest(req);
      if (valid === true) {
        res.status(200).end();
        storeData(req.body).then();
      } else {
        winston.error(`There was an error: ${valid}`);
        res.status(500).end();
      }
    } catch (error) {
      next(error);
    }
  })();

});

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
      new AddProcessor.Create(request,requestType)
    }

  } catch(e) {
    winston.error(e);
  }

}

/*
 | @data - an object containing the page request data.
 | checks to make sure the request is valid returning true if so.
*/
function processRequest(data) {

  const accountKey = process.env.accountKey;

  if (data.headers["x-account-key"] !== accountKey) {
    return "incorrectKey";
  } else if (Object.entries(data.body).length === 0) {
    return "emptyRequest";
  } else {
    return true;
  }

}

module.exports = router;