const express = require('express');
const router = express.Router();

// API endpoints
const authEndpoint = require('./authorization/auth.controller');
router.use('/auth', authEndpoint);

module.exports = router;
