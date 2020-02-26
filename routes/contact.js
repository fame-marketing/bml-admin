const express = require('express'),
  router  = express.Router(),
  winston = require('../bin/winston')
;

router.get('/', function(req, res) {
  res.render(
    'contact',
    {
      layout: 'default',
      title: 'Nearby Now Dashboard Contact Page',
      description: 'Nearby Now Dashboard Contact Page'
    }
  );
});

module.exports = router;