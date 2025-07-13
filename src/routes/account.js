const express = require('express');
const router = express.Router();
const { getAccountInfo } = require('../services/sendpulse');

/**
 * @route GET /api/account
 * @description Get account information including pricing plan, messages, bots, contacts, etc.
 * @header x-api-key - SendPulse API Key
 * @header x-api-secret - SendPulse API Secret
 * @returns {Object} Account information
 */
router.get('/', async (req, res) => {
  try {
    const { apiKey, apiSecret } = req.credentials;
    const accountInfo = await getAccountInfo(apiKey, apiSecret);
    res.json(accountInfo);
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch account information',
      error: error.message
    });
  }
});

module.exports = router;
