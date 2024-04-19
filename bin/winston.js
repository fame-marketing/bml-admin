import winston from 'winston'

const customFormat = winston.format.printf(({level, timestamp, message, stack}) => {
  if (stack) {
    return `${timestamp} | ${level} | ${stack}`;
  } else {
    return `${timestamp} | ${level} | ${message}`;
  }
});

const logger = winston.createLogger({
	level: 'info',
	exitOnError: false,
  format: winston.format.combine(
  	winston.format.timestamp(),
    winston.format.splat(),
    customFormat
  ),
  transports: [
		new winston.transports.File({
			filename: './bin/logs/error.log',
			level: 'error',
			handleExceptions: true
		}),
    new winston.transports.File({
      filename: './bin/logs/webhook.log',
			maxsize: 5242880,
			maxFiles: 5,
			json: true
    })
  ]
})
;

logger.stream = {
	write: function(message,encoding){
		logger.silly(message);
	}
};

export default logger
