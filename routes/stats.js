const express = require('express'),
  router  = express.Router(),
  winston = require('../bin/winston')
;

router.get('/', function(req, res) {
  res.render(
    'stats',
    {
      layout: 'default',
      title: 'Nearby Now Dashboard Stats Page',
      description: 'Nearby Now Dashboard Stats Page'
    }
  );
});

module.exports = router;