# MP3 Static Node Server

A Node.js server for streaming MP3 audio with ICY metadata support.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

## Installation

Install dependencies:
```bash
cd mp3static_node
npm install
```

## Running the Project

### Using PM2 (Recommended for Production)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the application:
```bash
pm2 start pm2.config.js --env production
```

3. Managing the application:
```bash
# View logs
pm2 logs mp3static_node

# Restart the application
pm2 restart mp3static_node

# Stop the application
pm2 stop mp3static_node

# Delete the application
pm2 delete mp3static_node

# View status of all PM2 processes
pm2 status
```

4. Set up PM2 to start automatically on system boot:
```bash
# Generate startup script
pm2 startup

# Save current PM2 process list
pm2 save
```

## Configuration

The server configuration is stored in `config.json`. You can modify the following settings:

```json
{
  "port": 3000,
  "streamUrl": "your-stream-url-here",
  "admin": {
    "id": "admin",
    "password": "password"
  }
}
```
