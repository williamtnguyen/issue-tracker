const express = require('express');
const server = express();
const bodyParser = require('body-parser');

// Middleware for getting input from client-side
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

// Serves all routes under prefix 'localhost:5000/api/*'
const routes = require('./routes/api/');
server.use('/api', routes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, (error) => {
  if (error) {
    throw new Error(error);
  }
  console.log('🔋 babu thomas 🔋');
});
