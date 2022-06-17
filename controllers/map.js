const winston = require('../bin/winston'),
      Db = require('../data/Database')
;

exports.render = (req,res) => {

  res.render(
    'map',
    {
      layout: 'map',
      title: 'Nearby Now Dashboard Map Page',
      description: 'Nearby Now Dashboard Map Page'
    }
  );

}

exports.getEvents = async (req,res) => {

  const recordsNum = req.body.hasOwnProperty('number') ? req.body.number : 15;

  const db = new Db(),
    checkinData = await db.readPool(
      `SELECT CheckinDateTime, Reference, CheckinImageUrl, UserName, City, State, PostalCode, Latitude, Longitude
            FROM nn_checkins_perma
            ORDER BY CheckinDateTime
            LIMIT ${recordsNum}`
    ),
    reviewData = await db.readPool(
      `SELECT ReviewSummary, ReviewDetail, ReviewRating, ResponseDate, CustomerName, CheckinDateTime, Reference, CheckinImageUrl, UserName, City, State, PostalCode
            FROM nn_reviews_perma
            ORDER BY ResponseDate
            LIMIT ${recordsNum}`
    ),
    data = checkinData.concat(reviewData)
  ;

  res.send(data);

}
