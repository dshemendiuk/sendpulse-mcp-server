const express = require('express');
const router = express.Router();
const { getBots } = require('../services/sendpulse');

/**
 * @route GET /api/bots
 * @description Get a list of connected bots with their details
 * @header x-api-key - SendPulse API Key
 * @header x-api-secret - SendPulse API Secret
 * @returns {Array} List of bots with their information
 */
router.get('/', async (req, res) => {
  try {
    const { apiKey, apiSecret } = req.credentials;
    const bots = await getBots(apiKey, apiSecret);
    res.json(bots);
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch bots',
      error: error.message
    });
  }
});

module.exports = router;
