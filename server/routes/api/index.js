const express = require('express');
const router = express.Router();

// API endpoints
const authEndpoint = require('./authorization.controller');
router.use('/auth', authEndpoint);
const teamsEndpoint = require('./team.controller');
router.use('/teams', teamsEndpoint);
const usersEndpoint = require('./users.controller');
router.use('/users', usersEndpoint);
const searchEndpoint = require('./navbar.controller');
router.use('/searchResults',searchEndpoint);

module.exports = router;
