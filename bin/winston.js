const winston = require('winston'),
      root = require('app-root-path')
;

logger = new winston.createLogger({
	format: winston.format.combine(
		winston.format.splat(),
		winston.format.simple()
	),
	transports: [
		new winston.transports.File({
			filename: `${root}/logs/webhook.log`, level: 'info'
		}),
    new winston.transports.File({
      filename: `${root}/logs/error.log`, level: 'error'
    })
	]
})
;

logger.stream = {
	write: function(message) {
		logger.silly(message);
	}
};

module.exports = logger;