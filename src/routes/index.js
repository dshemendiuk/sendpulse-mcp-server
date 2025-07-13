const express = require('express');
const router = express.Router();
const accountRoutes = require('./account');
const botsRoutes = require('./bots');
const dialogsRoutes = require('./dialogs');
const toolsRoutes = require('./tools');

// Mount routes
router.use('/', toolsRoutes); // This should come first to handle the root path
router.use('/account', accountRoutes);
router.use('/bots', botsRoutes);
router.use('/dialogs', dialogsRoutes);

module.exports = router;
