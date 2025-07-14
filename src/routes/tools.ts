import { Request, Response } from 'express';
import { MCP } from '@modelcontextprotocol/sdk';

const router = express.Router();
const mcp = new MCP({
  name: 'SendPulse MCP',
  description: 'MCP server for SendPulse API',
  version: '1.0.0'
});

// Register tools
mcp.registerTool('get_account_info', {
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
    // Implementation will go here
    return {
      success: true,
      data: {} // Will be implemented with SendPulse API call
    };
  }
});

// Get list of tools
router.get('/', (req: Request, res: Response) => {
  const tools = mcp.getTools();
  
  res.json({
    success: true,
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }))
  });
});

export default router;
