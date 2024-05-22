#!/usr/bin/env node

/**
 * Module dependencies.
 */
import app from '../app.js'
import open from 'open'
import logger from './winston.js'
import http from 'http'

/**
 * Get port from environment and store in Express.
 */
(async () => {

  /**
   * Create HTTP server.
   */

  const server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen();
  server.on('error', onError);
  server.on('listening', onListening);

  /**
   * Event listener for HTTP server "error" event.
   */
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error('requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error('is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {

    let addr = server.address();
    let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    logger.debug('Listening on ' + bind);

    const openingUrl = "[company_url]:" + addr.port + "/";
    open(openingUrl);


  }

})();
