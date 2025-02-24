import app from '../app.js';
import debugLib from 'debug';
import http from 'http';
// import { port as envPort } from '../config/env.js;';

const debug = debugLib('shopping-cart:server');

const server = http.createServer(app);

const normalizedPort = '3000';
app.set('port', normalizedPort);

/**
 * Creating HTTP server.
 */

server.listen(normalizedPort);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind =
    typeof normalizedPort === 'string'
      ? 'Pipe ' + normalizedPort
      : 'Port ' + normalizedPort;

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
  const address = server.address();
  const bind =
    typeof address === 'string' ? 'pipe ' + address : 'port ' + address.port;
  debug('Listening on ' + bind);
}
