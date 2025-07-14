"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const sendpulse_1 = require("./services/sendpulse");
dotenv_1.default.config();
// Authentication middleware for HTTP endpoints
const authenticate = (req, res, next) => {
    const clientId = req.headers['x-api-key'];
    const clientSecret = req.headers['x-api-secret'];
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
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// HTTP Endpoints
app.get('/api/account', authenticate, async (req, res) => {
    try {
        const { clientId, clientSecret } = req.credentials;
        const accountInfo = await (0, sendpulse_1.getAccountInfo)({ clientId, clientSecret });
        res.json({
            success: true,
            data: accountInfo
        });
    }
    catch (error) {
        console.error('Error getting account info:', error);
        res.status(error.status || 500).json({
            success: false,
            message: 'Failed to get account information',
            error: error.message
        });
    }
});
app.get('/api/bots', authenticate, async (req, res) => {
    try {
        const { clientId, clientSecret } = req.credentials;
        const bots = await (0, sendpulse_1.getBots)({ clientId, clientSecret });
        res.json({
            success: true,
            data: bots
        });
    }
    catch (error) {
        console.error('Error getting bots:', error);
        res.status(error.status || 500).json({
            success: false,
            message: 'Failed to get bots',
            error: error.message
        });
    }
});
app.get('/api/dialogs', authenticate, async (req, res) => {
    try {
        const { clientId, clientSecret } = req.credentials;
        const { size, skip, search_after, order } = req.query;
        const dialogs = await (0, sendpulse_1.getDialogs)({ clientId, clientSecret }, {
            size: size ? parseInt(size) : undefined,
            skip: skip ? parseInt(skip) : undefined,
            search_after: search_after,
            order: order || 'desc'
        });
        res.json({
            success: true,
            data: dialogs
        });
    }
    catch (error) {
        console.error('Error getting dialogs:', error);
        res.status(error.status || 500).json({
            success: false,
            message: 'Failed to get dialogs',
            error: error.message
        });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
// Create MCP server for AI assistant integration
const mcpServer = new mcp_js_1.McpServer({
    name: 'sendpulse-mcp-server',
    version: '1.0.2',
}, {
    capabilities: {
        tools: {},
    },
});
// Register MCP tools (these still need credentials as parameters for MCP protocol)
mcpServer.tool('get_account_info', 'Get account information including pricing plan, messages, bots, contacts, etc.', {
    clientId: zod_1.z.string().describe('SendPulse API Key (Client ID)'),
    clientSecret: zod_1.z.string().describe('SendPulse API Secret (Client Secret)'),
}, async ({ clientId, clientSecret }) => {
    try {
        const accountInfo = await (0, sendpulse_1.getAccountInfo)({ clientId, clientSecret });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(accountInfo, null, 2),
                },
            ],
        };
    }
    catch (error) {
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
});
mcpServer.tool('get_bots', 'Get a list of connected bots with their details', {
    clientId: zod_1.z.string().describe('SendPulse API Key (Client ID)'),
    clientSecret: zod_1.z.string().describe('SendPulse API Secret (Client Secret)'),
}, async ({ clientId, clientSecret }) => {
    try {
        const bots = await (0, sendpulse_1.getBots)({ clientId, clientSecret });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(bots, null, 2),
                },
            ],
        };
    }
    catch (error) {
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
});
mcpServer.tool('get_dialogs', 'Get a list of dialogs with pagination', {
    clientId: zod_1.z.string().describe('SendPulse API Key (Client ID)'),
    clientSecret: zod_1.z.string().describe('SendPulse API Secret (Client Secret)'),
    size: zod_1.z.number().optional().describe('Number of items per page'),
    skip: zod_1.z.number().optional().describe('Number of items to skip'),
    search_after: zod_1.z.string().optional().describe('ID of the element after which to search'),
    order: zod_1.z.enum(['asc', 'desc']).optional().describe('Sort order (asc/desc)'),
}, async ({ clientId, clientSecret, size, skip, search_after, order }) => {
    try {
        const dialogs = await (0, sendpulse_1.getDialogs)({ clientId, clientSecret }, {
            size,
            skip,
            search_after,
            order: order || 'desc',
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(dialogs, null, 2),
                },
            ],
        };
    }
    catch (error) {
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
});
// Determine mode based on environment or arguments
const mode = process.env.MODE || (process.argv.includes('--http') ? 'http' : 'mcp');
async function main() {
    if (mode === 'mcp') {
        // MCP mode: Run as stdio MCP server
        const transport = new stdio_js_1.StdioServerTransport();
        await mcpServer.connect(transport);
        console.error('SendPulse MCP server running on stdio');
    }
    else {
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
