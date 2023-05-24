const express = require('express'),
      router = express.Router(),
      indexRouter = require('./index')
;

router.use('/', indexRouter);
router.use('/webhook', require('./webhook'));
router.use('/import', require('./import'));
router.use('/dataTest', require('./datatest'));
router.use('/map', require('./map'));
router.use('/settings', require('./settings'));

module.exports = router;
