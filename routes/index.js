const express = require('express'),
      router  = express.Router(),
      indexController = require('../controllers/index'),
      winston = require('../bin/winston')
;

router.get('/', indexController.render);

router.post('/', indexController.validatePage);

module.exports = router;
