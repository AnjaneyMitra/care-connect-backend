# Google Maps API Key Setup Guide

## What You Need
For Feature 3 (Location & Geo Matching), you need:
- **Geocoding API** - Converts addresses to coordinates (lat/lng)

## Step-by-Step Setup

### 1. Go to Google Cloud Console
Open: https://console.cloud.google.com/

### 2. Create a New Project (or Select Existing)
- Click on the project dropdown at the top
- Click "New Project"
- Enter project name: `care-connect-backend` (or any name you prefer)
- Click "Create"
- Wait for the project to be created (takes a few seconds)

### 3. Enable Billing (Required for Google Maps APIs)
⚠️ **Important**: Google Maps APIs require billing to be enabled, but they offer:
- **$200 free credit per month**
- Geocoding API: First 40,000 requests/month are FREE
- You won't be charged unless you exceed the free tier

To enable billing:
- Go to: https://console.cloud.google.com/billing
- Click "Link a billing account" or "Create billing account"
- Follow the prompts to add payment information
- Note: You can set up budget alerts to avoid unexpected charges

### 4. Enable the Geocoding API
- Go to: https://console.cloud.google.com/apis/library
- Search for "Geocoding API"
- Click on "Geocoding API"
- Click the "Enable" button
- Wait for it to be enabled (takes a few seconds)

### 5. Create API Credentials
- Go to: https://console.cloud.google.com/apis/credentials
- Click "Create Credentials" at the top
- Select "API Key"
- Your API key will be generated and displayed
- **Copy the API key** - you'll need it for your .env file

### 6. Restrict Your API Key (Recommended for Security)
After creating the key:
- Click on the API key name to edit it
- Under "API restrictions":
  - Select "Restrict key"
  - Check only "Geocoding API"
- Under "Application restrictions" (optional but recommended):
  - Select "IP addresses"
  - Add your server's IP address
  - For development, you can add `0.0.0.0/0` (any IP) but remove this in production
- Click "Save"

### 7. Add API Key to Your Project
Create or edit your `.env` file in the project root:

```bash
# In /Applications/Vscode/care-connect-backend/.env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the actual API key you copied.

### 8. Verify It Works
Test the geocoding endpoint:

```bash
# Start your server
npm run start:dev

# Test the geocoding endpoint
curl -X POST http://localhost:3000/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Bandra West, Mumbai, Maharashtra"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "lat": 19.0596,
    "lng": 72.8295
  }
}
```

## Quick Links

| Step | Direct Link |
|------|-------------|
| Google Cloud Console | https://console.cloud.google.com/ |
| Enable Geocoding API | https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com |
| Create Credentials | https://console.cloud.google.com/apis/credentials |
| Billing Setup | https://console.cloud.google.com/billing |

## Pricing Information

### Geocoding API Pricing
- **Free tier**: $200 credit per month (covers ~40,000 requests)
- **After free tier**: $5.00 per 1,000 requests
- **For this project**: You'll likely stay within the free tier during development

### Cost Estimation for Development
- Testing: ~100 requests/day = 3,000/month = **FREE**
- Light usage: ~1,000 requests/day = 30,000/month = **FREE**

### Set Up Budget Alerts (Recommended)
1. Go to: https://console.cloud.google.com/billing/budgets
2. Click "Create Budget"
3. Set budget amount: $10 (or any amount)
4. Set alert threshold: 50%, 90%, 100%
5. Add your email for notifications

## Security Best Practices

### ✅ DO:
- Restrict API key to only Geocoding API
- Add IP restrictions for production
- Store API key in `.env` file (never commit to git)
- Set up budget alerts
- Rotate API keys periodically

### ❌ DON'T:
- Commit API keys to version control
- Share API keys publicly
- Use the same key for frontend and backend
- Leave API key unrestricted

## Troubleshooting

### Error: "API key not valid"
- Check if Geocoding API is enabled
- Verify API key is copied correctly
- Check if API restrictions allow Geocoding API

### Error: "This API project is not authorized"
- Enable billing on your Google Cloud project
- Wait a few minutes after enabling billing

### Error: "You have exceeded your rate limit"
- You've used your free quota
- Check usage at: https://console.cloud.google.com/apis/dashboard
- Consider upgrading or optimizing requests

### No Response / Null Results
- Check if GOOGLE_MAPS_API_KEY is set in .env
- Restart your server after adding the key
- Verify the address format is correct

## Alternative: Use Mock Data for Development

If you don't want to set up Google Maps API right now, the application will still work:
- Geocoding will return `success: false` without API key
- Nearby searches will work if you manually add lat/lng to profiles
- You can add coordinates directly in the database

## Environment File Example

```bash
# .env file
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/care_connect

# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Other configs
JWT_SECRET=your_jwt_secret_here
```

## Need Help?

If you encounter any issues:
1. Check the [Google Maps Platform Documentation](https://developers.google.com/maps/documentation/geocoding)
2. Verify your API key at: https://console.cloud.google.com/apis/credentials
3. Check API usage at: https://console.cloud.google.com/apis/dashboard

---

**Note**: The Geocoding API is optional for testing. The nearby search features will work as long as users/jobs have lat/lng coordinates in the database.
