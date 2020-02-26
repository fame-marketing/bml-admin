const express = require('express'),
  router  = express.Router(),
  winston = require('../bin/winston')
;

router.get('/', function(req, res) {
  res.render(
    'settings',
    {
      layout: 'default',
      title: 'Nearby Now Dashboard Settings',
      description: 'Nearby Now Dashboard Settings'
    }
  );
});

module.exports = router;