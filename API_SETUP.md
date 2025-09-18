# API Setup Guide

## Overview
The BEPWI Agricultural ERP system supports both online API integration and offline demo modes, providing flexibility for development, demo, and production environments.

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure your API settings:

```bash
cp .env.example .env
```

### API Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:1337/api` |
| `REACT_APP_API_TIMEOUT` | Request timeout in milliseconds | `10000` |
| `REACT_APP_ENABLE_API_LOGGING` | Enable API request logging | `true` (development only) |
| `REACT_APP_OFFLINE_MODE` | Force offline mode (disables API calls) | `false` |

### Example Configurations

#### Development (Local Strapi)
```env
REACT_APP_API_URL=http://localhost:1337/api
REACT_APP_API_TIMEOUT=10000
REACT_APP_ENABLE_API_LOGGING=true
REACT_APP_OFFLINE_MODE=false
```

#### Development (Offline Demo Mode)
```env
REACT_APP_API_URL=http://localhost:1337/api
REACT_APP_API_TIMEOUT=10000
REACT_APP_ENABLE_API_LOGGING=true
REACT_APP_OFFLINE_MODE=true
```

#### Production
```env
REACT_APP_API_URL=https://your-production-api.com/api
REACT_APP_API_TIMEOUT=15000
REACT_APP_ENABLE_API_LOGGING=false
REACT_APP_OFFLINE_MODE=false
```

## Backend Requirements

The frontend expects a Strapi-compatible API with the following endpoints:

### Authentication
- `POST /auth/local` - Login with email/password
- `GET /users/me` - Validate current token
- `POST /auth/local/register` - User registration
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

### Expected Request/Response Format

#### Login Request
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "roles": ["farm-management", "carpool", "warehouse", "hr", "sales"],
    "confirmed": true,
    "blocked": false
  }
}
```

## Changes Made

### Hybrid Authentication System
- Demo login functions are re-enabled and work offline
- Login pages show both demo login buttons and real authentication form
- System automatically falls back to offline mode if API is unavailable
- Demo logins work completely offline for development and presentation purposes

### API Integration
- Created centralized API configuration in `src/config/api.js`
- Updated `BaseApiService` to use environment-based configuration
- Added proper error handling and logging controls
- Implemented JWT token management

### Environment Management
- Added `.env` file support for easy configuration
- Created `.env.example` template
- Configured development vs production settings
- Added offline mode toggle for development flexibility

## Testing the Setup

### Online Mode (with API)
1. Start your backend API (e.g., Strapi on `http://localhost:1337`)
2. Ensure the API is accessible at the configured URL
3. Try logging in with valid credentials
4. Check browser console for API request logs (in development mode)

### Offline Mode (Demo)
1. Set `REACT_APP_OFFLINE_MODE=true` in your `.env` file, OR
2. Simply click the demo login buttons (they work regardless of API availability)
3. Demo login will work completely offline with simulated user data
4. All CRUD operations will work with mock data

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend API allows requests from your frontend domain
2. **404 Errors**: Verify the API base URL is correct in your `.env` file
3. **401 Errors**: Check if your API credentials are valid
4. **Timeout Errors**: Increase `REACT_APP_API_TIMEOUT` value

### Debug Mode
Set `REACT_APP_ENABLE_API_LOGGING=true` in development to see detailed API logs in browser console.