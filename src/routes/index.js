const express = require('express');
const router = express.Router();
const accountRoutes = require('./account');
const botsRoutes = require('./bots');
const dialogsRoutes = require('./dialogs');
const toolsRoutes = require('./tools');
const authenticate = require('../middleware/auth');

// Mount routes
router.use('/', toolsRoutes); // Public endpoint, no authentication

// Protected endpoints
router.use('/account', authenticate, accountRoutes);
router.use('/bots', authenticate, botsRoutes);
router.use('/dialogs', authenticate, dialogsRoutes);

module.exports = router;
