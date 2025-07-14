import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getAccountInfo, getBots, getDialogs } from './services/sendpulse';

dotenv.config();

// Extended Request interface to include credentials
interface AuthenticatedRequest extends Request {
  credentials?: {
    clientId: string;
    clientSecret: string;
  };
}

// Authentication middleware for HTTP endpoints
const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const clientId = req.headers['x-api-key'] as string;
  const clientSecret = req.headers['x-api-secret'] as string;

  if (!clientId || !clientSecret) {
    return res.status(401).json({
      success: false,
      message: 'Missing x-api-key or x-api-secret headers'
    });
  }

  req.credentials = { clientId, clientSecret };
  next();
};

// Create Express app for HTTP endpoints
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// HTTP Endpoints
app.get('/api/account', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId, clientSecret } = req.credentials!;
    const accountInfo = await getAccountInfo({ clientId, clientSecret });
    res.json({
      success: true,
      data: accountInfo
    });
  } catch (error: any) {
    console.error('Error getting account info:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Failed to get account information',
      error: error.message
    });
  }
});

app.get('/api/bots', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId, clientSecret } = req.credentials!;
    const bots = await getBots({ clientId, clientSecret });
    res.json({
      success: true,
      data: bots
    });
  } catch (error: any) {
    console.error('Error getting bots:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Failed to get bots',
      error: error.message
    });
  }
});

app.get('/api/dialogs', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId, clientSecret } = req.credentials!;
    const { size, skip, search_after, order } = req.query;
    
    const dialogs = await getDialogs(
      { clientId, clientSecret },
      {
        size: size ? parseInt(size as string) : undefined,
        skip: skip ? parseInt(skip as string) : undefined,
        search_after: search_after as string,
        order: (order as 'asc' | 'desc') || 'desc'
      }
    );
    
    res.json({
      success: true,
      data: dialogs
    });
  } catch (error: any) {
    console.error('Error getting dialogs:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Failed to get dialogs',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Create MCP server for AI assistant integration
const mcpServer = new McpServer(
  {
    name: 'sendpulse-mcp-server',
    version: '1.0.2',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register MCP tools (these still need credentials as parameters for MCP protocol)
mcpServer.tool(
  'get_account_info',
  'Get account information including pricing plan, messages, bots, contacts, etc.',
  {
    clientId: z.string().describe('SendPulse API Key (Client ID)'),
    clientSecret: z.string().describe('SendPulse API Secret (Client Secret)'),
  },
  async ({ clientId, clientSecret }) => {
    try {
      const accountInfo = await getAccountInfo({ clientId, clientSecret });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(accountInfo, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting account info: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

mcpServer.tool(
  'get_bots',
  'Get a list of connected bots with their details',
  {
    clientId: z.string().describe('SendPulse API Key (Client ID)'),
    clientSecret: z.string().describe('SendPulse API Secret (Client Secret)'),
  },
  async ({ clientId, clientSecret }) => {
    try {
      const bots = await getBots({ clientId, clientSecret });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(bots, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting bots: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

mcpServer.tool(
  'get_dialogs',
  'Get a list of dialogs with pagination',
  {
    clientId: z.string().describe('SendPulse API Key (Client ID)'),
    clientSecret: z.string().describe('SendPulse API Secret (Client Secret)'),
    size: z.number().optional().describe('Number of items per page'),
    skip: z.number().optional().describe('Number of items to skip'),
    search_after: z.string().optional().describe('ID of the element after which to search'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order (asc/desc)'),
  },
  async ({ clientId, clientSecret, size, skip, search_after, order }) => {
    try {
      const dialogs = await getDialogs(
        { clientId, clientSecret },
        {
          size,
          skip,
          search_after,
          order: order || 'desc',
        }
      );
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(dialogs, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting dialogs: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Determine mode based on environment or arguments
const mode = process.env.MODE || (process.argv.includes('--http') ? 'http' : 'mcp');

async function main() {
  if (mode === 'mcp') {
    // MCP mode: Run as stdio MCP server
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error('SendPulse MCP server running on stdio');
  } else {
    // HTTP mode: Run as Express server
    app.listen(PORT, () => {
      console.log(`SendPulse HTTP API server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log('API Endpoints:');
      console.log(`  GET /api/account - Get account information`);
      console.log(`  GET /api/bots - Get list of bots`);
      console.log(`  GET /api/dialogs - Get list of dialogs`);
      console.log('');
      console.log('Authentication: Use x-api-key and x-api-secret headers');
    });
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});