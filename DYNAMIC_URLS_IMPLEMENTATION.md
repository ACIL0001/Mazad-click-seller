# Dynamic URLs Implementation

This document explains how the seller application now uses dynamic URLs instead of hardcoded localhost URLs.

## Changes Made

### 1. Updated `src/config.tsx`
- Replaced hardcoded localhost URLs with environment variables
- Added fallback values for development
- Environment variables used:
  - `VITE_API_URL` - Base API URL
  - `VITE_SOCKET_URL` - WebSocket connection URL
  - `VITE_STATIC_URL` - Static assets URL

### 2. Updated `src/contexts/SocketContext.tsx`
- Replaced hardcoded `http://localhost:3000` with dynamic `app.socket`
- Now uses the socket URL from config file

### 3. Updated `src/layouts/dashboard/AccountPopover.tsx`
- Replaced hardcoded buyer URLs with environment variable `VITE_BUYER_URL`
- Used for profile link and buyer app switching

### 4. Updated `src/pages/chat/Chat.tsx`
- Replaced hardcoded localhost URL with dynamic `window.location.origin`
- More robust URL parsing for chat ID extraction

### 5. Updated `src/utils/function.chat.js`
- Replaced hardcoded localhost URLs with dynamic `app.baseURL`
- Added proper exports for the chat functions

## Environment Variables

Create a `.env` file in the seller directory with the following variables:

```env
# Development
VITE_API_URL=http://localhost:3000/
VITE_SOCKET_URL=http://localhost:3000/
VITE_STATIC_URL=http://localhost:3000/static/
VITE_BUYER_URL=http://localhost:3001

# Production (example)
# VITE_API_URL=https://api.mazadclick.com/
# VITE_SOCKET_URL=wss://api.mazadclick.com/
# VITE_STATIC_URL=https://api.mazadclick.com/static/
# VITE_BUYER_URL=https://buyer.mazadclick.com
```

## Benefits

1. **Environment Flexibility**: Easy switching between development, staging, and production
2. **No Hardcoded URLs**: All URLs are now configurable
3. **Consistent Configuration**: Single source of truth for all URLs
4. **Easy Deployment**: Just change environment variables for different environments

## Usage

The application will automatically use the environment variables if they are set, otherwise it will fall back to the default localhost URLs for development.

## Files Modified

- `src/config.tsx` - Main configuration with environment variables
- `src/contexts/SocketContext.tsx` - Dynamic socket connection
- `src/layouts/dashboard/AccountPopover.tsx` - Dynamic buyer app links
- `src/pages/chat/Chat.tsx` - Dynamic URL parsing
- `src/utils/function.chat.js` - Dynamic chat API calls
- `env.example` - Environment variables template 