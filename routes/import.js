const express = require('express'),
			router  = express.Router(),
			winston = require('../bin/winston')
;

router.get('/', function(req, res) {
	res.render(
		'import',
		{
		  layout: 'import',
			title: 'Import Data',
			description: 'import a csv'
		}
	);
});

module.exports = router;
