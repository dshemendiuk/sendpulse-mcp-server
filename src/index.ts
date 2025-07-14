import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { MCP } from '@modelcontextprotocol/sdk';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Initialize MCP server
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

// Mount MCP routes
app.use('/api', mcp.getRouter());

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
