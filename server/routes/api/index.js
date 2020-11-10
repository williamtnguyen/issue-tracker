const express = require('express');
const router = express.Router();

// API endpoints
const users = require('./authorization/users.controller');
router.use('/users', users);

module.exports = router;
