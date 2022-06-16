const express = require('express'),
      router  = express.Router(),
      mapController = require('../controllers/map')
;

router.get('/', mapController.render);

router.post('/', mapController.getEvents);

module.exports = router;
