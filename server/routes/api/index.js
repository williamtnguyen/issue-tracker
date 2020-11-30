const express = require('express');
const router = express.Router();

// API endpoints
const authEndpoint = require('./authorization.controller');
router.use('/auth', authEndpoint);
const projectsEndpoint = require('./projects.controller');
router.use('/projects', projectsEndpoint);
const teamsEndpoint = require('./teams.controller');
router.use('/teams', teamsEndpoint);
const usersEndpoint = require('./users.controller');
router.use('/users', usersEndpoint);
const taskEndpoint = require('./tasks.controller');
router.use('/tasks', taskEndpoint);

module.exports = router;
