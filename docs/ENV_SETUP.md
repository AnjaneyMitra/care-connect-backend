# Environment Configuration

## Backend Environment Variables

The backend uses the following environment variables. You don't need to set these for the frontend, but understanding them helps with debugging.

| Variable | Description | Default/Example |
|----------|-------------|-----------------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5433/db` |
| `JWT_SECRET` | Secret for signing JWTs | `your-secret-key` |
| `GOOGLE_MAPS_API_KEY` | Key for Geocoding API | `AIzaSy...` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID | `...` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | `...` |

## Frontend Environment Variables

These are the variables you'll likely need in your frontend application (e.g., `.env.local` in Vite/Next.js).

```bash
# Base URL for API requests
VITE_API_BASE_URL=http://localhost:3000

# Google Maps API Key (for frontend maps/places autocomplete)
# Note: This should be restricted to your domain in Google Cloud Console
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

## Google Maps Setup

Both frontend and backend use Google Maps services.
- **Backend**: Uses Geocoding API (server-side)
- **Frontend**: Likely uses Maps JavaScript API and Places API

Ensure your API key has the following APIs enabled:
1. Geocoding API
2. Maps JavaScript API
3. Places API (New)
