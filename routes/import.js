const express = require('express'),
			router  = express.Router(),
      multer = require('multer'),
      fileHandler = multer({storage:multer.memoryStorage()}),
      importController = require('../controllers/import')
;

router.get('/', importController.render);

router.post('/submit', fileHandler.single('file'), importController.storeData);

module.exports = router;
