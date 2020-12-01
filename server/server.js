const express = require('express');

const server = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const AWS = require('aws-sdk');

// Middleware for getting input from client-side
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

// Middleware for reading HTTPOnly Cookies from incoming requests
server.use(cookieParser());

// Set configuration for AWS
AWS.config.loadFromPath('./config/secrets.json');

// Serves all routes under prefix 'localhost:5000/api/*'
const routes = require('./routes/api');

server.use('/api', routes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, (error) => {
  if (error) {
    throw new Error(error);
  }
  console.log('🔋 babu thomas 🔋');
});
