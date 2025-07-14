import { Request, Response } from 'express';
import { MCP } from '@modelcontextprotocol/sdk';
import { getAccountInfo } from '../services/sendpulse';

const router = express.Router();

// Register account tool with MCP
router.registerTool('get_account_info', {
  description: 'Get account information including pricing plan, messages, bots, contacts, etc.',
  parameters: {
    required: [],
    properties: {
      apiKey: {
        type: 'string',
        description: 'SendPulse API Key'
      },
      apiSecret: {
        type: 'string',
        description: 'SendPulse API Secret'
      }
    }
  },
  execute: async (params) => {
    try {
      const { apiKey, apiSecret } = params;
      const accountInfo = await getAccountInfo(apiKey, apiSecret);
      return {
        success: true,
        data: accountInfo
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
});

// Express route for compatibility
router.get('/', async (req: Request, res: Response) => {
  try {
    const { apiKey, apiSecret } = req.credentials;
    const accountInfo = await getAccountInfo(apiKey, apiSecret);
    res.json({
      success: true,
      data: accountInfo
    });
  } catch (error) {
    console.error('Error getting account info:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to get account information',
      error: error.message
    });
  }
});

export default router;
