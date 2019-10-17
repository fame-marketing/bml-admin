const express = require('express'),
			path = require('path'),
			router  = express.Router(),
			winston = require('../bin/winston')
;

router.get('/', function(req, res) {
	res.render(
		'import',
		{
			title: 'import Nearby Now Event Data',
			description: 'import a csv'
		}
	);
});

module.exports = router;