# API Reference Guide

This document provides a comprehensive reference for the Care Connect Backend API.

## General Information

- **Base URL**: `http://localhost:4000` (Local Development)
- **Frontend URL**: `http://localhost:3000` (Next.js)
- **API Version**: v1
- **Content-Type**: `application/json`
- **CORS**: Enabled for `http://localhost:3000` by default

## Authentication

The API supports both traditional email/password authentication and Google OAuth.

- **Method**: JWT (JSON Web Tokens)
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: Configurable via JWT_SECRET
- **Token Source**: Obtained from `/auth/login` or `/auth/google/callback`

### Protected Endpoints
The following endpoints require JWT authentication:
- `GET /users/me`

All other endpoints are currently public or handle authentication internally.

## Endpoints

### Authentication

#### POST /auth/signup
Register a new user with email and password.

- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "parent" | "nanny"  // Optional, defaults to "parent"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "role": "parent" | "nanny",
    "is_verified": false,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  }
  ```
  **Note**: Password hash and OAuth tokens are excluded from response for security.
  
- **Error Response** (400):
  ```json
  {
    "statusCode": 400,
    "message": ["email must be an email", "password is too weak"],
    "error": "Bad Request"
  }
  ```

#### POST /auth/login
Login with email and password to receive a JWT access token.

- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "string",
      "role": "parent" | "nanny" | "admin"
    }
  }
  ```
- **Error Response** (401):
  ```json
  {
    "statusCode": 401,
    "message": "Invalid credentials",
    "error": "Unauthorized"
  }
  ```

#### GET /auth/google
Initiate Google OAuth login flow.

- **Authentication**: Not required
- **Behavior**: Redirects to Google OAuth consent screen
- **Usage**: Redirect user to this endpoint to start OAuth flow
- **Configuration**: Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in environment variables

#### GET /auth/google/callback
Google OAuth callback endpoint (automatically called by Google).

- **Authentication**: Handled by Google OAuth
- **Behavior**: Processes Google OAuth response and returns JWT token
- **Response**:
  ```json
  {
    "access_token": "string",
    "user": {
      "id": "uuid",
      "email": "string",
      "role": "parent",
      "oauth_provider": "google",
      "oauth_provider_id": "string"
    }
  }
  ```
- **Note**: This endpoint is called by Google after user authorization. The `oauth_access_token` and `oauth_refresh_token` are stored securely in the database but not returned in the response.

### Users

#### GET /users/me
Retrieve the currently authenticated user's profile.

- **Authentication**: Required (JWT)
- **Headers**:
  ```
  Authorization: Bearer <your_jwt_token>
  ```
- **Response**: Complete `User` object with profile and nanny_details (if role is nanny)
  ```json
  {
    "id": "uuid",
    "email": "string",
    "role": "parent" | "nanny",
    "is_verified": boolean,
    "oauth_provider": "google" | null,
    "oauth_provider_id": "string" | null,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp",
    "profiles": {
      "first_name": "string",
      "last_name": "string",
      "phone": "string",
      "address": "string",
      "lat": "decimal string",
      "lng": "decimal string",
      "profile_image_url": "string | null"
    },
    "nanny_details": {  // Only present if role is "nanny"
      "skills": ["string"],
      "experience_years": number,
      "hourly_rate": "decimal string",
      "bio": "string",
      "availability_schedule": {
        "monday": ["09:00-17:00"],
        "tuesday": ["09:00-17:00"]
      }
    }
  }
  ```

#### GET /users/nannies
Retrieve all users with the role "nanny" (caregivers).

- **Authentication**: Not required
- **Response**: Array of `User` objects with nanny role
  ```json
  [
    {
      "id": "uuid",
      "email": "string",
      "role": "nanny",
      "is_verified": boolean,
      "oauth_provider": "google" | null,
      "oauth_provider_id": "string" | null,
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp",
      "profiles": {
        "user_id": "uuid",
        "first_name": "string",
        "last_name": "string",
        "phone": "string",
        "address": "string",
        "lat": "decimal string",
        "lng": "decimal string",
        "profile_image_url": "string | null",
        "created_at": "ISO 8601 timestamp",
        "updated_at": "ISO 8601 timestamp"
      },
      "nanny_details": {
        "user_id": "uuid",
        "skills": ["CPR Certified", "First Aid", "Early Childhood Education"],
        "experience_years": 5,
        "hourly_rate": "800.00",
        "bio": "Experienced nanny with...",
        "availability_schedule": {
          "monday": ["09:00-17:00"],
          "tuesday": ["09:00-17:00"]
        },
        "created_at": "ISO 8601 timestamp",
        "updated_at": "ISO 8601 timestamp"
      }
    }
  ]
  ```
  **Note**: 
  - Results are ordered by creation date (newest first)
  - Sensitive fields excluded: `password_hash`, `oauth_access_token`, `oauth_refresh_token`, `verification_token`, `reset_password_token`
  - This endpoint is useful for displaying all available caregivers on a search/browse page

#### GET /users/:id
Retrieve a specific user's profile by ID.

- **Authentication**: Not required
- **Path Parameters**:
  - `id` (string): User UUID
- **Response**: `User` object (same structure as `/users/me`)
- **Note**: Sensitive fields (password_hash, oauth tokens, verification tokens) are excluded

#### PUT /users/:id
Update a user's profile information.

- **Authentication**: Not required (should be protected in production)
- **Path Parameters**:
  - `id` (string): User UUID
- **Request Body**: `UpdateUserDto` (all fields optional)
  ```json
  {
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "address": "string",
    "lat": "decimal",
    "lng": "decimal",
    "profile_image_url": "string",
    "skills": ["string"],  // For nannies only
    "experience_years": number,  // For nannies only
    "hourly_rate": "decimal",  // For nannies only
    "bio": "string",  // For nannies only
    "availability_schedule": {}  // For nannies only
  }
  ```
- **Response**: Updated `User` object

#### POST /users/upload-image
Upload or update a profile image URL.

- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "userId": "uuid",
    "imageUrl": "string"
  }
  ```
- **Response**: Updated `User` object with new profile_image_url
- **Note**: Currently accepts URL string. File upload functionality can be added in future.

### Location

All location endpoints use the Haversine formula for distance calculation and Google Maps Geocoding API for address resolution.

#### POST /location/geocode
Convert a physical address to geographic coordinates (latitude/longitude).

- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "address": "string"  // e.g., "123 Main St, City, State, Country"
  }
  ```
- **Response** (Success):
  ```json
  {
    "success": true,
    "data": {
      "lat": 12.9715987,
      "lng": 77.5945627
    }
  }
  ```
- **Response** (Failure):
  ```json
  {
    "success": false,
    "message": "Could not geocode the provided address"
  }
  ```
- **Note**: Requires valid `GOOGLE_MAPS_API_KEY` in environment variables

#### GET /location/nannies/nearby
Find nannies within a specified radius from given coordinates.

- **Authentication**: Not required
- **Query Parameters**:
  - `lat` (number, required): Latitude (-90 to 90)
  - `lng` (number, required): Longitude (-180 to 180)
  - `radius` (number, optional): Radius in kilometers (default: 10)
- **Example**: `/location/nannies/nearby?lat=12.9715987&lng=77.5945627&radius=15`
- **Response**:
  ```json
  {
    "success": true,
    "count": 3,
    "radius": "15km",
    "data": [
      {
        "id": "uuid",
        "email": "string",
        "role": "nanny",
        "is_verified": boolean,
        "created_at": "ISO 8601 timestamp",
        "updated_at": "ISO 8601 timestamp",
        "profiles": {
          "user_id": "uuid",
          "first_name": "string",
          "last_name": "string",
          "phone": "string",
          "address": "string",
          "lat": "decimal string",
          "lng": "decimal string",
          "profile_image_url": "string | null",
          "created_at": "ISO 8601 timestamp",
          "updated_at": "ISO 8601 timestamp"
        },
        "nanny_details": {
          "user_id": "uuid",
          "skills": ["CPR Certified", "First Aid", "Early Childhood Education"],
          "experience_years": 5,
          "hourly_rate": "800.00",
          "bio": "Experienced nanny with...",
          "availability_schedule": {
            "monday": ["09:00-17:00"],
            "tuesday": ["09:00-17:00"],
            "wednesday": ["09:00-17:00"],
            "thursday": ["09:00-17:00"],
            "friday": ["09:00-17:00"]
          },
          "created_at": "ISO 8601 timestamp",
          "updated_at": "ISO 8601 timestamp"
        },
        "distance": 3.45  // Distance in km from search coordinates
      }
    ]
  }
  ```
  
  **Note**: 
  - Results are sorted by distance (closest first)
  - Only users with role "nanny" and valid lat/lng coordinates are included
  - Sensitive fields excluded: `password_hash`, `oauth_access_token`, `oauth_refresh_token`, `verification_token`, `reset_password_token`

#### GET /location/jobs/nearby
Find job postings within a specified radius from given coordinates.

- **Authentication**: Not required
- **Query Parameters**:
  - `lat` (number, required): Latitude (-90 to 90)
  - `lng` (number, required): Longitude (-180 to 180)
  - `radius` (number, optional): Radius in kilometers (default: 10)
- **Example**: `/location/jobs/nearby?lat=12.9715987&lng=77.5945627&radius=20`
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "radius": "20km",
    "data": [
      {
        "id": "uuid",
        "title": "Need nanny for 2 kids",
        "description": "Looking for experienced nanny...",
        "date": "2025-11-25",
        "time": "09:00:00",
        "location_lat": "12.9716",
        "location_lng": "77.5946",
        "status": "open" | "closed",
        "created_at": "ISO 8601 timestamp",
        "updated_at": "ISO 8601 timestamp",
        "parent": {
          "id": "uuid",
          "email": "string",
          "role": "parent",
          "profiles": {
            "first_name": "string",
            "last_name": "string",
            "phone": "string",
            "address": "string"
          }
        },
        "distance": 5.23  // Distance in km from search coordinates
      }
    ]
  }
  ```
  
  **Note**: 
  - Results are sorted by distance (closest first)
  - Only jobs with valid location_lat/location_lng are included
  - Parent information included for contact purposes
  - Sensitive parent data excluded from response

## Data Models

### User Roles
- `parent`: Can post jobs, book nannies
- `nanny`: Can apply to jobs, be booked by parents
- `admin`: Administrative access (not fully implemented)

### Job Status
- `open`: Job is available for applications
- `closed`: Job is no longer available

### Application Status (Not yet implemented in API)
- `applied`: Nanny has applied to job
- `accepted`: Parent accepted the application
- `rejected`: Parent rejected the application

### Booking Status (Not yet implemented in API)
- `requested`: Booking requested by parent
- `confirmed`: Nanny confirmed the booking
- `cancelled`: Booking was cancelled
- `completed`: Booking completed successfully

## Error Responses

All error responses follow this standard format:

```json
{
  "statusCode": number,
  "message": "string" | ["string"],
  "error": "string"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request parameters or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have permission for this action
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

### Example Error Responses

**Validation Error (400)**:
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than 6 characters"
  ],
  "error": "Bad Request"
}
```

**Authentication Error (401)**:
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Not Found Error (404)**:
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. This should be added in production.

## CORS Configuration

CORS is enabled for:
- `http://localhost:3000` (Next.js frontend)
- Credentials are supported

To add additional origins, update the CORS configuration in `src/main.ts`.

## Future Endpoints (Not Yet Implemented)

The following features are planned but not yet available via API:

### Email Verification
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/resend-verification` - Resend verification email

### Password Reset
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Applications
- `POST /applications` - Apply to a job
- `GET /applications/nanny/:nannyId` - Get nanny's applications
- `GET /applications/job/:jobId` - Get job's applications
- `PUT /applications/:id` - Update application status

### Bookings

#### POST /bookings
Create a new booking manually (Temporary endpoint for testing).

- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "jobId": "uuid",
    "nannyId": "uuid"
  }
  ```
- **Response**: `Booking` object
  ```json
  {
    "id": "uuid",
    "job_id": "uuid",
    "parent_id": "uuid",
    "nanny_id": "uuid",
    "status": "CONFIRMED",
    "start_time": "ISO 8601 timestamp",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  }
  ```

#### GET /bookings/active
Get all active bookings (CONFIRMED or IN_PROGRESS) for the current user.

- **Authentication**: Required (JWT)
- **Response**: Array of `Booking` objects with job and profile details.

#### GET /bookings/parent/me
Get all bookings for the current parent user.

- **Authentication**: Required (JWT - Parent role)
- **Response**: Array of `Booking` objects.

#### GET /bookings/nanny/me
Get all bookings for the current nanny user.

- **Authentication**: Required (JWT - Nanny role)
- **Response**: Array of `Booking` objects.

#### GET /bookings/:id
Get details of a specific booking.

- **Authentication**: Required (JWT - User must be part of booking)
- **Response**: `Booking` object with full details.

#### PUT /bookings/:id/start
Mark a booking as IN_PROGRESS.

- **Authentication**: Required (JWT - Nanny only)
- **Response**: Updated `Booking` object.

#### PUT /bookings/:id/complete
Mark a booking as COMPLETED.

- **Authentication**: Required (JWT - Nanny or Parent)
- **Response**: Updated `Booking` object.

#### PUT /bookings/:id/cancel
Cancel a booking.

- **Authentication**: Required (JWT - Nanny or Parent)
- **Request Body**:
  ```json
  {
    "reason": "string"
  }
  ```
- **Response**: Updated `Booking` object.

### Messaging (Chat)

#### POST /chat
Create a new chat room manually.

- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "bookingId": "uuid"
  }
  ```
- **Response**: `Chat` object.

#### GET /chat/booking/:bookingId
Get the chat room associated with a booking.

- **Authentication**: Required (JWT)
- **Response**: `Chat` object with latest messages.

#### GET /chat/:chatId/messages
Get message history for a chat room with pagination.

- **Authentication**: Required (JWT)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 50)
- **Response**: Array of `Message` objects.

#### POST /chat/:chatId/message
Send a message via HTTP (Alternative to WebSocket).

- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "content": "string",
    "attachmentUrl": "string" // Optional
  }
  ```
- **Response**: Created `Message` object.

### Reviews

#### POST /reviews
Create a review for a completed booking.

- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "bookingId": "uuid",
    "rating": number, // 1-5
    "comment": "string"
  }
  ```
- **Response**: `Review` object.

#### GET /reviews/user/:userId
Get all reviews received by a specific user (parent or nanny).

- **Authentication**: Not required
- **Response**: Array of `Review` objects with reviewer details.

#### GET /reviews/booking/:bookingId
Get the review associated with a specific booking.

- **Authentication**: Not required
- **Response**: Array of `Review` objects (usually one).

### Notifications

#### POST /notifications/send
Manually trigger a notification (for testing/admin).

- **Authentication**: Required (JWT)
- **Request Body**:
  ```json
  {
    "type": "email" | "push" | "sms",
    "to": "string", // email or user_id or phone
    "subject": "string", // Optional (for email/push)
    "content": "string"
  }
  ```
- **Response**: Success status.

### Admin

All admin endpoints require JWT authentication AND admin role.

#### GET /admin/users
Get all users in the system.

- **Authentication**: Required (JWT - Admin only)
- **Response**: Array of `User` objects with basic info.

#### GET /admin/bookings
Get all bookings in the system.

- **Authentication**: Required (JWT - Admin only)
- **Response**: Array of `Booking` objects with job and user details.

#### GET /admin/stats
Get system statistics.

- **Authentication**: Required (JWT - Admin only)
- **Response**:
  ```json
  {
    "totalUsers": number,
    "totalBookings": number,
    "activeBookings": number
  }
  ```

#### PUT /admin/users/:id/verify
Verify a user account.

- **Authentication**: Required (JWT - Admin only)
- **Response**: Updated `User` object.

#### PUT /admin/users/:id/ban
Ban a user account.

- **Authentication**: Required (JWT - Admin only)
- **Response**: Updated `User` object.

### Payments
- `POST /payments` - Process payment
- `GET /payments/:bookingId` - Get payment for booking
- `GET /payments/user/:userId` - Get user's payment history

---

**Last Updated**: November 20, 2025  
**API Version**: 1.0.0  
**Backend Port**: 4000
