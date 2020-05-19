// https://github.com/Rob--W/cors-anywhere
const corsProxy = require('cors-anywhere');

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 8081;

corsProxy.createServer({
  originWhitelist: [], // Allow all origins if empty
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
