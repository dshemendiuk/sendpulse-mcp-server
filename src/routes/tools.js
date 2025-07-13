const express = require('express');
const router = express.Router();

/**
 * @route GET /api
 * @description List all available tools/endpoints
 * @returns {Object} List of available tools with their descriptions and parameters
 */
router.get('/', (req, res) => {
  const tools = {
    success: true,
    tools: [
      {
        name: 'get_account_info',
        description: 'Get account information including pricing plan, messages, bots, contacts, etc.',
        method: 'GET',
        path: '/api/account',
        headers: [
          { name: 'x-api-key', type: 'string', required: true, description: 'SendPulse API Key' },
          { name: 'x-api-secret', type: 'string', required: true, description: 'SendPulse API Secret' }
        ]
      },
      {
        name: 'get_bots',
        description: 'Get a list of connected bots with their details',
        method: 'GET',
        path: '/api/bots',
        headers: [
          { name: 'x-api-key', type: 'string', required: true, description: 'SendPulse API Key' },
          { name: 'x-api-secret', type: 'string', required: true, description: 'SendPulse API Secret' }
        ]
      },
      {
        name: 'get_dialogs',
        description: 'Get a list of dialogs with pagination',
        method: 'GET',
        path: '/api/dialogs',
        query_parameters: [
          { name: 'size', type: 'number', required: false, description: 'Number of items per page', default: 10 },
          { name: 'skip', type: 'number', required: false, description: 'Number of items to skip', default: 0 },
          { name: 'search_after', type: 'string', required: false, description: 'ID of the element after which to search' },
          { name: 'order', type: 'string', required: false, description: 'Sort order (asc/desc)', default: 'desc', enum: ['asc', 'desc'] }
        ],
        headers: [
          { name: 'x-api-key', type: 'string', required: true, description: 'SendPulse API Key' },
          { name: 'x-api-secret', type: 'string', required: true, description: 'SendPulse API Secret' }
        ]
      }
    ]
  };

  res.json(tools);
});

module.exports = router;
