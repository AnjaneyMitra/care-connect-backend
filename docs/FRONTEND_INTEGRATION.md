# Frontend Integration Guide

Welcome to the Care Connect Backend! This guide serves as the entry point for frontend developers integrating with our API.

## 📚 Documentation Map

| Document | Description |
|----------|-------------|
| [**API Reference**](./API.md) | Complete list of endpoints, parameters, and responses. |
| [**Type Definitions**](./TYPES.md) | TypeScript interfaces for models and DTOs. Copy these to your project! |
| [**Error Handling**](./ERROR_HANDLING.md) | How to handle API errors and status codes. |
| [**Environment Setup**](./ENV_SETUP.md) | Required environment variables for local dev. |
| [**Setup Guide**](./SETUP.md) | How to run the backend locally. |
| [**Testing Guide**](../Markdown/TESTING.md) | Test data and how to run tests. |

## 🚀 Quick Start

### 1. Run the Backend
Follow the [Setup Guide](./SETUP.md) to get the backend running on `http://localhost:4000`.

**Important**: The backend runs on port **4000** to avoid conflicts with Next.js frontend on port **3000**.

### 2. Configure Your Next.js App
In your Next.js application, set the API base URL:

```typescript
// .env.local or next.config.js
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Authentication
Currently, authentication is in development. You can access most endpoints without a token, or use a dummy token if required by specific middleware (check API docs).

### 4. Common Workflows

#### Fetching User Profile
```typescript
// GET /users/:id
const response = await fetch(`http://localhost:4000/users/${userId}`);
const user = await response.json();
console.log(user.profiles?.first_name);
```

#### Finding Nearby Nannies
```typescript
// GET /location/nannies/nearby
const params = new URLSearchParams({
  lat: '19.0596',
  lng: '72.8295',
  radius: '10'
});
const response = await fetch(`http://localhost:4000/location/nannies/nearby?${params}`);
const data = await response.json();
console.log(data.count, 'nannies found');
```

### 5. Test Data
Use these credentials to test:
- **Parent**: `parent@example.com`
- **Nanny**: `nanny@example.com`

See [Testing Guide](../Markdown/TESTING.md) for full list of test users.

## 💡 Tips for Frontend Devs

- **Types**: Use the interfaces in [TYPES.md](./TYPES.md) to ensure type safety.
- **Validation**: The backend uses `class-validator`. Expect 400 Bad Request with detailed messages if you send invalid data.
- **Images**: Profile image upload currently accepts a URL string. In the future, this will change to file upload.
- **Maps**: You'll need your own Google Maps API key for the frontend (Map display, Autocomplete). The backend handles Geocoding.
- **CORS**: The backend is configured to accept requests from `http://localhost:3000` by default. For production, set the `FRONTEND_URL` environment variable.
- **Security**: Sensitive fields (password_hash, oauth tokens, verification tokens) are automatically excluded from API responses.
