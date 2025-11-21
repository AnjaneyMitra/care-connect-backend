# Google OAuth Testing Guide

## Overview

The Care Connect backend supports Google OAuth 2.0 for user authentication. This allows users to sign up and log in using their Google accounts.

## Configuration

### Environment Variables

The following environment variables must be set in your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

### Where to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. For **Application type**, select **Web application**
7. Add authorized redirect URIs:
   - Development: `http://localhost:4000/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
8. Copy the **Client ID** and **Client Secret**

## How It Works

### Authentication Flow

1. **User initiates Google login**: Frontend redirects to `GET /auth/google`
2. **Google authentication**: User authenticates with Google
3. **Callback**: Google redirects back to `GET /auth/google/callback`
4. **User creation/lookup**:
   - If user exists (by `oauth_provider_id`): Return existing user
   - If email exists but no OAuth: Link Google account to existing user
   - If new user: Create user with profile
5. **JWT token**: Backend returns JWT access token

### Data Storage

When a user signs up via Google OAuth, the following data is stored:

**In `users` table:**
- `email`: User's Google email
- `role`: Default 'parent'
- `is_verified`: Set to `true` (Google emails are pre-verified)
- `oauth_provider`: 'google'
- `oauth_provider_id`: Google's unique user ID
- `oauth_access_token`: Google access token (for future API calls)
- `oauth_refresh_token`: Google refresh token

**In `profiles` table (automatically created):**
- `first_name`: From Google profile
- `last_name`: From Google profile
- `profile_image_url`: User's Google profile picture

### Code Implementation

**Google Strategy** (`src/auth/strategies/google.strategy.ts`):
- Configures Passport Google OAuth strategy
- Extracts user data from Google profile
- Returns user object with OAuth tokens

**Auth Service** (`src/auth/auth.service.ts`):
- `googleLogin()` method handles the OAuth flow
- Creates user with profile if new
- Links OAuth to existing email if found
- Returns JWT token for session management

## Testing Google OAuth

### Manual Testing (Browser)

Since Google OAuth requires browser interaction, you cannot test it with curl. Instead:

1. **Start the backend**:
   ```bash
   npm run start:dev
   ```

2. **Navigate to the OAuth endpoint**:
   ```
   http://localhost:4000/auth/google
   ```

3. **Sign in with Google**: You'll be redirected to Google's login page

4. **Check the response**: After authentication, you'll receive a JSON response with:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "uuid",
       "email": "user@gmail.com",
       "role": "parent"
     }
   }
   ```

### Frontend Integration

For a complete flow, the frontend should:

1. **Redirect to OAuth**:
   ```javascript
   window.location.href = 'http://localhost:4000/auth/google';
   ```

2. **Handle callback** (if using frontend callback):
   - Configure `GOOGLE_CALLBACK_URL` to point to frontend
   - Frontend receives auth code and exchanges it for token

3. **Store token**:
   ```javascript
   localStorage.setItem('token', access_token);
   ```

## Verification Checklist

After setting up Google OAuth, verify:

- [ ] Environment variables are set correctly
- [ ] Google Cloud Console has correct redirect URIs
- [ ] OAuth consent screen is configured
- [ ] Test users can sign in via Google
- [ ] User profile is created with first/last name
- [ ] Profile picture URL is stored
- [ ] JWT token is returned
- [ ] Subsequent logins work (user lookup by oauth_provider_id)
- [ ] Email linking works (existing email + new OAuth)

## Common Issues

### Issue: "redirect_uri_mismatch"
**Solution**: Ensure `GOOGLE_CALLBACK_URL` in `.env` matches the redirect URI in Google Cloud Console exactly.

### Issue: "invalid_client"
**Solution**: Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct.

### Issue: User created but no profile
**Solution**: This was fixed in commit `d3dedc6e`. Ensure you have the latest code.

### Issue: OAuth tokens not stored
**Solution**: Check that `oauth_access_token` and `oauth_refresh_token` are being passed from the strategy to the service.

## Security Notes

- OAuth tokens are stored in the database for potential future use (e.g., accessing Google Calendar)
- Tokens are excluded from API responses (see `UsersService`)
- Users authenticated via Google have `is_verified` set to `true` automatically
- The `oauth_provider_id` is unique per provider, preventing duplicate accounts

## Next Steps

Once Google OAuth is working:
1. Test with multiple Google accounts
2. Test linking OAuth to existing email account
3. Implement frontend OAuth flow
4. Add error handling for OAuth failures
5. Consider adding other OAuth providers (Facebook, Apple, etc.)
