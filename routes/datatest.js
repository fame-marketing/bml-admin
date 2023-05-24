const express = require('express'),
      router  = express.Router(),
      datatestController = require('../controllers/datatest')
;

router.get('/', datatestController.render);

module.exports = router;
