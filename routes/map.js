const express = require('express'),
  router  = express.Router(),
  winston = require('../bin/winston')
;

router.get('/', function(req, res) {
  res.render(
    'map',
    {
      layout: 'map',
      title: 'Nearby Now Dashboard Map Page',
      description: 'Nearby Now Dashboard Map Page'
    }
  );
});

module.exports = router;