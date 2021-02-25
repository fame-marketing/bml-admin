const express = require('express'),
      router  = express.Router(),
      settingsController = require('../controllers/settings')
;

router.get('/', settingsController.render);

router.post('/', settingsController.scanForPages);

module.exports = router;
