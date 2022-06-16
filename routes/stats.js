const express = require('express'),
      router  = express.Router(),
      statsController = require('../controllers/stats')
;

router.get('/', statsController.render);

router.post('/', statsController.getStats)

module.exports = router;
