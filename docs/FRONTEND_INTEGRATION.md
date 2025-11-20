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

The backend supports **JWT-based authentication** with both email/password and Google OAuth.

**Authentication Flow:**
1. User signs up or logs in
2. Backend returns JWT access token
3. Frontend stores token (localStorage, cookies, or session)
4. Include token in subsequent requests via `Authorization` header

### 4. Common Workflows

#### User Signup
```typescript
// POST /auth/signup
const response = await fetch('http://localhost:4000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe'
  })
});
const newUser = await response.json();
console.log('User created:', newUser.id);
```

#### User Login
```typescript
// POST /auth/login
const response = await fetch('http://localhost:4000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123'
  })
});
const { access_token, user } = await response.json();

// Store token for future requests
localStorage.setItem('token', access_token);
console.log('Logged in as:', user.email);
```

#### Google OAuth Login
```typescript
// Redirect user to Google OAuth
window.location.href = 'http://localhost:4000/auth/google';

// After Google redirects back to /auth/google/callback,
// the backend will return the token. Handle it in your callback page:
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('access_token');
if (token) {
  localStorage.setItem('token', token);
}
```

#### Making Authenticated Requests
```typescript
// GET /users/me (requires authentication)
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:4000/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const currentUser = await response.json();
```

#### Fetching All Nannies/Caregivers
```typescript
// GET /users/nannies (public endpoint)
const response = await fetch('http://localhost:4000/users/nannies');
const nannies = await response.json();
console.log(`Found ${nannies.length} caregivers`);
// Each nanny object includes profiles and nanny_details
```

#### Fetching User Profile
```typescript
// GET /users/:id (public endpoint)
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

#### Finding Nearby Jobs
```typescript
// GET /location/jobs/nearby
const params = new URLSearchParams({
  lat: '19.0596',
  lng: '72.8295',
  radius: '15'
});
const response = await fetch(`http://localhost:4000/location/jobs/nearby?${params}`);
const { success, count, data } = await response.json();
console.log(`Found ${count} jobs nearby`);
```

#### Geocoding an Address
```typescript
// POST /location/geocode
const response = await fetch('http://localhost:4000/location/geocode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: 'Bandra West, Mumbai, Maharashtra'
  })
});
const { success, data } = await response.json();
if (success) {
  console.log('Coordinates:', data.lat, data.lng);
}
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
