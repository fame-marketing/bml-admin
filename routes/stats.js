const express = require('express'),
      router  = express.Router(),
      winston = require('../bin/winston'),
      Db = require('../data/Database')
;

router.get('/', async function(req, res) {

  res.render(
    'stats',
    {
      layout: 'stats',
      title: 'Nearby Now Dashboard Stats Page',
      description: 'Nearby Now Dashboard Stats Page'
    }
  );

});

router.post('/', async function(req, res) {

  const type = req.body.type;
  const db = new Db();
  let data;

  switch (type) {

    case 'employee':
      data = await db.readPool(
      `(SELECT CreatedAt, UserName, City, State, PostalCode, null as ReviewRating, null as ResponseDate, null as CustomerName,
              COUNT(*) as EventTotal
              FROM nn_checkins_perma
              GROUP BY UserName)
              UNION
             (SELECT CreatedAt, UserName, City, State, PostalCode, ReviewRating, ResponseDate, CustomerName,
              COUNT(*) as EventTotal
              FROM nn_reviews_perma
              GROUP BY UserName) 
             ORDER BY EventTotal DESC 
             LIMIT 7`
      );
      break;

    case 'location':
      data = await db.readPool(
        `SELECT City, State,
                COUNT(*) as EventTotal
                FROM nn_city_totals
                GROUP BY City`
      );
      break;

    case 'reviews':
      data = await db.readPool(
        ``
      );
      break;

    default:
      data = "the data type was not set so no data was retrieved";

  }


  res.send(data);
})

module.exports = router;
