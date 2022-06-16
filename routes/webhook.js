const express = require('express'),
      router  = express.Router(),
      webhookController = require('../controllers/webhook')
;

router.post('/', webhookController.storeEvent);

module.exports = router;
