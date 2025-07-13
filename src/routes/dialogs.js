const express = require('express');
const router = express.Router();
const { getDialogs } = require('../services/sendpulse');

/**
 * @route GET /api/dialogs
 * @description Get a list of dialogs with pagination
 * @header x-api-key - SendPulse API Key
 * @header x-api-secret - SendPulse API Secret
 * @queryParam {number} [size=10] - Number of items per page
 * @queryParam {number} [skip=0] - Number of items to skip
 * @queryParam {string} [search_after] - ID of the element after which to search
 * @queryParam {string} [order=desc] - Sort order (asc/desc)
 * @returns {Object} Paginated list of dialogs
 */
router.get('/', async (req, res) => {
  try {
    const { apiKey, apiSecret } = req.credentials;
    const { size, skip, search_after, order } = req.query;
    
    const dialogs = await getDialogs(apiKey, apiSecret, {
      size: size ? parseInt(size) : undefined,
      skip: skip ? parseInt(skip) : undefined,
      search_after,
      order: order || 'desc'
    });
    
    res.json(dialogs);
  } catch (error) {
    console.error('Error fetching dialogs:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch dialogs',
      error: error.message
    });
  }
});

module.exports = router;
