#!/usr/bin/env node

/**
 * Module dependencies.
 */
import app from '../app.js'
import open from 'open'
import logger from './winston.js'
import http from 'http'

/**
 * Get port from environment or use default.
 */
const port = process.env.PORT || 3001;
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
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
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  
  logger.info('=======================================================');
  logger.info(`NearbyNow Automation Server running in development mode`);
  logger.info(`Server listening on http://localhost:${addr.port}`);
  logger.info('=======================================================');
  logger.info('Available endpoints:');
  logger.info('- GET  /                           - Main dashboard');
  logger.info('- GET  /service-areas              - Get all service areas');
  logger.info('- GET  /service-area/:area         - Get details for a specific service area');
  logger.info('- GET  /generate-vercel-pages      - Manually trigger Vercel page generation');
  logger.info('- POST /vercel-webhook             - Webhook endpoint for Vercel page generation');
  logger.info('=======================================================');

  // Open browser to the local server
  const openingUrl = `http://localhost:${addr.port}/`;
  open(openingUrl);
}

// Log that we're starting in development mode
logger.info('Starting NearbyNow Automation Server in development mode...');