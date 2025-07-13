# SendPulse MCP Server

A Message Control Protocol (MCP) server that acts as a wrapper around the SendPulse Chatbots API, providing a simplified interface for interacting with SendPulse services.

## Features

- **Authentication**: Secure authentication using SendPulse API keys
- **Endpoints**:
  - `GET /api/account` - Get account information
  - `GET /api/bots` - Get list of connected bots
  - `GET /api/dialogs` - Get list of dialogs with pagination

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- SendPulse API credentials (API Key and API Secret)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sendpulse-mcp-server.git
   cd sendpulse-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your SendPulse credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000` by default.

2. Make requests to the API:
   ```bash
   # Get account info
   curl -X GET http://localhost:3000/api/account \
     -H "x-api-key: YOUR_API_KEY" \
     -H "x-api-secret: YOUR_API_SECRET"

   # Get list of bots
   curl -X GET http://localhost:3000/api/bots \
     -H "x-api-key: YOUR_API_KEY" \
     -H "x-api-secret: YOUR_API_SECRET"

   # Get dialogs with pagination
   curl -X GET "http://localhost:3000/api/dialogs?size=10&skip=0&order=desc" \
     -H "x-api-key: YOUR_API_KEY" \
     -H "x-api-secret: YOUR_API_SECRET"
   ```

## Deployment

### Option 1: Railway.app (Recommended for Free Tier)

1. Create an account on [Railway](https://railway.app/)
2. Create a new project and select "Deploy from GitHub repo"
3. Select your forked repository
4. Add the following environment variables in the Railway dashboard:
   - `PORT` (Railway will provide this)
   - `NODE_ENV=production`
5. Deploy the app

### Option 2: Render.com

1. Create an account on [Render](https://render.com/)
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `sendpulse-mcp-server`
   - Region: Choose the one closest to you
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
5. Add environment variables:
   - `NODE_ENV=production`
6. Click "Create Web Service"

## API Documentation

### Authentication

All requests must include the following headers:
- `x-api-key`: Your SendPulse API Key
- `x-api-secret`: Your SendPulse API Secret

### Endpoints

#### GET /api/account

Get account information including pricing plan, messages, bots, contacts, etc.

**Response:**
```json
{
  "success": true,
  "data": {
    "tariff": {
      "code": "free",
      "max_bots": 1,
      "max_contacts": 1000,
      "max_messages": 10000,
      "max_tags": 100,
      "max_variables": 100,
      "branding": false,
      "is_exceeded": false,
      "is_expired": false,
      "expired_at": "2024-12-31T23:59:59+00:00"
    },
    "statistics": {
      "messages": 123,
      "bots": 1,
      "contacts": 50,
      "variables": 5
    },
    "services": ["telegram", "facebook"]
  }
}
```

#### GET /api/bots

Get a list of connected bots.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "5f8d7a6d4c3b2a1e0f9e8d7c",
      "channel_data": {
        "access_token": "token123",
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

#### GET /api/dialogs

Get a list of dialogs with pagination.

**Query Parameters:**
- `size`: Number of items per page (default: 10)
- `skip`: Number of items to skip (default: 0)
- `search_after`: ID of the element after which to search
- `order`: Sort order (`asc` or `desc`, default: `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "_id": "5f8d7a6d4c3b2a1e0f9e8d7c",
        "bot_id": "5f8d7a6d4c3b2a1e0f9e8d7b",
        "contact": {
          "id": "123456789",
          "full_name": "John Doe",
          "profile_pic": "https://example.com/avatar.jpg"
        },
        "last_inbox_message": {
          "text": "Hello, how can I help you?",
          "date": "2023-01-01T12:30:00+00:00"
        },
        "last_outbox_message": {
          "text": "Hi there!",
          "date": "2023-01-01T12:25:00+00:00"
        },
        "service": 1,
        "user_id": 12345,
        "inbox_unread_count": 2,
        "is_chat_opened": true,
        "created_at": "2023-01-01T12:00:00+00:00",
        "updated_at": "2023-01-01T12:30:00+00:00"
      }
    ],
    "sort": {},
    "total": 1,
    "size": 10,
    "search_after": null,
    "order": "desc"
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes along with error messages in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (in development)"
}
```

## License

MIT
