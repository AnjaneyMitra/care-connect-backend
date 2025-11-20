# Environment Configuration

## Backend Environment Variables

The backend uses the following environment variables. You don't need to set these for the frontend, but understanding them helps with debugging.

| Variable | Description | Default/Example | Required |
|----------|-------------|-----------------|----------|
| `PORT` | Server port | `4000` | Yes |
| `NODE_ENV` | Environment mode | `development` | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5433/careconnect` | Yes |
| `POSTGRES_USER` | Database username | `project_user` | Yes |
| `POSTGRES_PASSWORD` | Database password | `davanj123` | Yes |
| `POSTGRES_DB` | Database name | `careconnect` | Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-secret-key-change-in-production` | Yes |
| `GOOGLE_MAPS_API_KEY` | Google Maps Geocoding API key | `AIzaSy...` | Optional* |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | `123456789-abc.apps.googleusercontent.com` | Optional** |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret | `GOCSPX-...` | Optional** |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:4000/auth/google/callback` | Optional** |

**Notes:**
- *Required for geocoding features to work
- **Required only if using Google OAuth authentication

## Frontend Environment Variables

These are the variables you'll need in your Next.js application (`.env.local`).

```bash
# Base URL for API requests
NEXT_PUBLIC_API_URL=http://localhost:4000

# Google Maps API Key (for frontend maps/places autocomplete)
# Note: This should be restricted to your domain in Google Cloud Console
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

## Google Maps Setup

Both frontend and backend use Google Maps services.
- **Backend**: Uses Geocoding API (server-side)
- **Frontend**: Likely uses Maps JavaScript API and Places API

Ensure your API key has the following APIs enabled:
1. Geocoding API
2. Maps JavaScript API
3. Places API (New)

## Google OAuth Setup

To enable Google OAuth authentication:

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Select **Web application** as application type
7. Add authorized redirect URIs:
   - `http://localhost:4000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
8. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add to your `.env` file:
```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

### 3. Test OAuth Flow

1. Navigate to `http://localhost:4000/auth/google`
2. Sign in with your Google account
3. You should be redirected to the callback URL with an access token

## Security Best Practices

- **Never commit `.env` file** to version control
- **Use different secrets** for development and production
- **Rotate JWT_SECRET** regularly in production
- **Restrict Google Maps API key** by HTTP referrer or IP address
- **Enable only required Google APIs** to minimize security risks
- **Use HTTPS** in production for all API endpoints
