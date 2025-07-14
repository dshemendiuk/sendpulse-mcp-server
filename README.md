# SendPulse MCP Server

A hybrid Model Context Protocol (MCP) server that provides both HTTP API endpoints and MCP tools for interacting with the SendPulse Chatbots API. This server allows both direct HTTP requests with header authentication and AI assistant integration via MCP.

## Features

- **Dual Mode Support**: Runs as either HTTP API server or MCP server
- **Header Authentication**: Uses `x-api-key` and `x-api-secret` headers for HTTP endpoints
- **MCP Protocol Compliance**: Standard MCP integration for AI assistants
- **SendPulse API Integration**: Complete wrapper around SendPulse Chatbots API
- **TypeScript Support**: Fully written in TypeScript with proper type definitions

## Available Endpoints/Tools

- **Account Info**: Retrieve account information including pricing plan and usage statistics
- **Bots Management**: Get list of connected bots with their details and status  
- **Dialogs Access**: Retrieve dialogs with pagination support

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- SendPulse API credentials (Client ID and Client Secret)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sendpulse-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript project:
   ```bash
   npm run build
   ```

## Usage

### Mode 1: MCP Server (Default - For AI Assistants)

Run as an MCP server for AI assistant integration:

```bash
# Start MCP server (default mode)
npm start

# Or explicitly start MCP mode
npm run start:mcp

# Development mode with MCP server
npm run dev
```

The server runs on stdio transport for MCP communication.

#### MCP Configuration

Add this server to your AI assistant's MCP configuration:

**Claude Desktop config:**
```json
{
  "mcpServers": {
    "sendpulse": {
      "command": "node",
      "args": ["/path/to/sendpulse-mcp-server/dist/index.js"]
    }
  }
}
```

**Alternative MCP config:**
```json
{
  "mcpServers": {
    "sendpulse": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/path/to/sendpulse-mcp-server"
    }
  }
}
```

### Mode 2: HTTP API Server (For direct API access)

Run as a traditional HTTP API server with header-based authentication:

```bash
# Start HTTP server
npm run start:http

# Development mode with HTTP server
npm run dev:http
```

The server will run on `http://localhost:3000`.

#### HTTP Authentication

All HTTP requests must include these headers:
- `x-api-key`: Your SendPulse Client ID
- `x-api-secret`: Your SendPulse Client Secret

#### HTTP Endpoints

**GET /api/account**
```bash
curl -X GET http://localhost:3000/api/account \
  -H "x-api-key: YOUR_CLIENT_ID" \
  -H "x-api-secret: YOUR_CLIENT_SECRET"
```

**GET /api/bots**
```bash
curl -X GET http://localhost:3000/api/bots \
  -H "x-api-key: YOUR_CLIENT_ID" \
  -H "x-api-secret: YOUR_CLIENT_SECRET"
```

**GET /api/dialogs**
```bash
curl -X GET "http://localhost:3000/api/dialogs?size=10&skip=0&order=desc" \
  -H "x-api-key: YOUR_CLIENT_ID" \
  -H "x-api-secret: YOUR_CLIENT_SECRET"
```

**GET /health** (Health check - no auth required)
```bash
curl -X GET http://localhost:3000/health
```

### Getting SendPulse API Credentials

1. Go to [SendPulse API Settings](https://login.sendpulse.com/settings/#api)
2. Create new API credentials if you don't have them
3. Note down your **Client ID** and **Client Secret**

## API Reference

### HTTP Responses

All HTTP endpoints return JSON responses in this format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* API response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Account Information

**Endpoint:** `GET /api/account`  
**MCP Tool:** `get_account_info`

Retrieves account information including pricing plan and usage statistics.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "tariff": {
      "code": "free",
      "max_bots": 1,
      "max_contacts": 1000,
      "max_messages": 10000,
      "is_exceeded": false,
      "is_expired": false
    },
    "statistics": {
      "messages": 123,
      "bots": 1,
      "contacts": 50
    },
    "services": ["telegram", "facebook"]
  }
}
```

### Bots Information

**Endpoint:** `GET /api/bots`  
**MCP Tool:** `get_bots`

Retrieves a list of connected bots with their details.

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bot_id_123",
      "channel_data": {
        "id": 123456789,
        "name": "My Bot",
        "username": "my_bot"
      },
      "inbox": {
        "total": 42,
        "unread": 5
      },
      "status": 3,
      "created_at": "2023-01-01T12:00:00+00:00"
    }
  ]
}
```

### Dialogs Information

**Endpoint:** `GET /api/dialogs`  
**MCP Tool:** `get_dialogs`

Retrieves dialogs with pagination support.

**Query Parameters:**
- `size` (number, optional): Number of items per page (default: 10)
- `skip` (number, optional): Number of items to skip (default: 0)
- `search_after` (string, optional): ID of the element after which to search
- `order` (string, optional): Sort order - "asc" or "desc" (default: "desc")

**Response Example:**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "dialog_id_123",
        "bot_id": "bot_id_123",
        "contact": {
          "id": "123456789",
          "full_name": "John Doe",
          "profile_pic": "https://example.com/avatar.jpg"
        },
        "last_inbox_message": {
          "text": "Hello, how can I help you?",
          "date": "2023-01-01T12:30:00+00:00"
        },
        "inbox_unread_count": 2,
        "is_chat_opened": true,
        "created_at": "2023-01-01T12:00:00+00:00"
      }
    ],
    "total": 1,
    "size": 10,
    "order": "desc"
  }
}
```

## Development

### Build the project:
```bash
npm run build
```

### Available Scripts:
- `npm start` - Start MCP server (default)
- `npm run start:mcp` - Start MCP server explicitly
- `npm run start:http` - Start HTTP server
- `npm run dev` - Development mode (MCP server)
- `npm run dev:http` - Development mode (HTTP server)

### Project Structure:
```
src/
├── index.ts          # Hybrid server with HTTP endpoints and MCP tools
└── services/
    └── sendpulse.ts  # SendPulse API service functions
```

## Environment Variables

- `MODE` - Server mode: "mcp" (default) or "http"
- `PORT` - HTTP server port (default: 3000, HTTP mode only)
- `NODE_ENV` - Environment: "development" or "production"

## Deployment

### HTTP API Deployment

The server can be deployed to any platform that supports Node.js:

**Railway.app:**
```bash
# Set environment variables:
# MODE=http
# PORT=(automatic)
```

**Render.com:**
```bash
# Build Command: npm install && npm run build
# Start Command: npm run start:http
```

**Docker:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV MODE=http
EXPOSE 3000
CMD ["npm", "start"]
```

### MCP Server Deployment

For MCP usage, the server typically runs locally and is configured in the AI assistant's settings.

## Error Handling

### HTTP Mode
- Returns appropriate HTTP status codes
- Includes error details in JSON response
- 401 for missing/invalid authentication headers
- 500 for server errors

### MCP Mode
- Returns error information in MCP-compatible format
- Includes `isError: true` flag for error responses
- Error details included in content text

## Security Notes

- API credentials are validated with each request
- HTTPS used for all SendPulse API communications
- Credentials are not stored server-side
- CORS enabled for web applications
- Express security middleware included

## API Documentation

This server integrates with the SendPulse Chatbots API. For complete API documentation:
https://sendpulse.com/swagger/chatbots/?lang=en

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Support

For issues related to:
- This server: Create an issue in this repository
- SendPulse API: Contact [SendPulse Support](https://sendpulse.com/support)
- MCP Protocol: Visit [Model Context Protocol documentation](https://modelcontextprotocol.io)