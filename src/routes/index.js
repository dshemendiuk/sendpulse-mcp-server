const express = require('express');
const router = express.Router();
const accountRoutes = require('./account');
const botsRoutes = require('./bots');
const dialogsRoutes = require('./dialogs');

// Mount routes
router.use('/account', accountRoutes);
router.use('/bots', botsRoutes);
router.use('/dialogs', dialogsRoutes);

module.exports = router;
