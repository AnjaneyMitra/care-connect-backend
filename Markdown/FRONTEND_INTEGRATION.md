# Frontend Integration Guide - Complete Feature Set

This document provides comprehensive integration details for **all completed backend features** that require frontend implementation.

---

## Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
2. [Service Request & Matching](#2-service-request--matching)
3. [Booking System](#3-booking-system)
4. [Admin Module](#4-admin-module)
5. [Reviews & Ratings](#5-reviews--ratings)
6. [Location & AI Features](#6-location--ai-features)
7. [Scheduling & Availability](#7-scheduling--availability)

---

## 1. Authentication & Authorization

### 1.1 Refresh Token Rotation

**What's Expected:**
- Store both `access_token` and `refresh_token` after login
- Implement token refresh logic before access token expires
- Handle token rotation seamlessly

**Endpoints:**

#### Login (Returns Both Tokens)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "parent"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token"
}
```

### 1.2 Forgot/Reset Password

**What's Expected:**
- Forgot password form (email input)
- Reset password form (token + new password)
- Success/error messaging

**Endpoints:**

#### Request Password Reset
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

### 1.3 Email Verification

**What's Expected:**
- Verification link handler (from email)
- Display verification status

**Endpoint:**
```http
GET /auth/verify?token=verification_token
```

---

## 2. Service Request & Matching

### 2.1 Cancel Request

**What's Expected:**
- Cancel button on pending requests
- Confirmation dialog

**Endpoint:**
```http
PUT /requests/:id/cancel
Authorization: Bearer {access_token}
```

---

## 3. Booking System

### 3.1 Cancellation with Reason & Fee

**What's Expected:**
- Cancellation form with reason dropdown/textarea
- Display cancellation fee if within 24 hours
- Confirmation before cancelling

**Endpoint:**
```http
PUT /bookings/:id/cancel
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Emergency came up"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "CANCELLED",
  "cancellation_reason": "Emergency came up",
  "cancellation_fee": 25.00,
  "cancellation_fee_status": "pending"
}
```

---

## 4. Admin Module

**What's Expected:**
- Admin dashboard with multiple sections
- Role-based access control (admin only)

### 4.1 User Management

```http
GET /admin/users
PUT /admin/users/:id/verify
PUT /admin/users/:id/ban
```

### 4.2 Dispute Resolution

**Endpoints:**
```http
GET /admin/disputes
GET /admin/disputes/:id
PUT /admin/disputes/:id/resolve
Content-Type: application/json

{
  "resolution": "Refund issued to parent",
  "resolvedBy": "admin_user_id"
}
```

### 4.3 Payment Monitoring

```http
GET /admin/payments
GET /admin/payments/stats
```

**Response (Stats):**
```json
{
  "totalPayments": 150,
  "pendingPayments": 5,
  "totalRevenue": 12500.00
}
```

### 4.4 Review Moderation

```http
GET /admin/reviews
PUT /admin/reviews/:id/approve
PUT /admin/reviews/:id/reject
```

### 4.5 System Settings

```http
GET /admin/settings
GET /admin/settings/:key
POST /admin/settings/:key
Content-Type: application/json

{
  "value": 20  // e.g., matching_radius in km
}
```

### 4.6 Advanced Analytics

```http
GET /admin/stats
GET /admin/stats/advanced
```

**Response (Advanced):**
```json
{
  "completionRate": 92.5,
  "acceptanceRate": 85.0,
  "totalRevenue": 12500.00,
  "popularBookingTimes": [
    { "hour": 9, "count": 45 },
    { "hour": 14, "count": 38 }
  ]
}
```

---

## 5. Reviews & Ratings

**What's Expected:**
- Review form with 5 rating categories (1-5 stars each)
- Edit/delete options for own reviews
- Response functionality for reviewees

### 5.1 Create Review

```http
POST /reviews
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "bookingId": "uuid",
  "revieweeId": "uuid",
  "rating": 5,
  "rating_punctuality": 5,
  "rating_professionalism": 5,
  "rating_care_quality": 5,
  "rating_communication": 4,
  "comment": "Excellent nanny!"
}
```

### 5.2 Update Review

```http
PUT /reviews/:id
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review"
}
```

### 5.3 Delete Review

```http
DELETE /reviews/:id
Authorization: Bearer {access_token}
```

### 5.4 Add Response

```http
POST /reviews/:id/response
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "response": "Thank you for the kind words!"
}
```

---

## 6. Location & AI Features

### 6.1 Favorite Nannies

**What's Expected:**
- Favorite/unfavorite button on nanny profiles
- List of favorite nannies
- Visual indicator on favorited nannies

**Endpoints:**
```http
GET /favorites
POST /favorites/:nannyId
DELETE /favorites/:nannyId
```

### 6.2 Live Location Tracking

**What's Expected:**
- Real-time map showing nanny location
- WebSocket connection for live updates
- Display for parents only when booking is "en route"

**WebSocket Connection:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000/location');

// Parent subscribes to booking
socket.emit('location:subscribe', { bookingId: 'xxx' });

// Listen for location updates
socket.on('location:updated', (data) => {
  console.log('Nanny location:', data.lat, data.lng);
  // Update map marker
});

// Nanny sends location updates
socket.emit('location:update', {
  bookingId: 'xxx',
  lat: 40.7128,
  lng: -74.0060
});
```

### 6.3 Geofencing Alerts

**What's Expected:**
- Alert notification when nanny leaves geofence
- Display geofence radius on map

**WebSocket Event:**
```javascript
socket.on('geofence:alert', (data) => {
  console.log('Geofence alert:', data.message);
  console.log('Distance:', data.distance, 'Allowed:', data.radius);
  // Show alert to parent
});
```

---

## 7. Scheduling & Availability

### 7.1 Recurring Bookings

**What's Expected:**
- Recurring booking creation form
- Pattern selector (Daily/Weekly/Monthly)
- Day/date picker based on frequency
- List of recurring bookings with upcoming dates
- Edit/cancel recurring bookings

**Endpoints:**

#### Create Recurring Booking
```http
POST /recurring-bookings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "nannyId": "uuid",
  "recurrencePattern": "WEEKLY_MON_WED_FRI",
  "startDate": "2024-12-10",
  "endDate": "2025-01-10",
  "startTime": "09:00",
  "durationHours": 4,
  "numChildren": 2,
  "childrenAges": [3, 5]
}
```

#### List Recurring Bookings
```http
GET /recurring-bookings
```

#### Get Details (with generated bookings)
```http
GET /recurring-bookings/:id
```

#### Update
```http
PUT /recurring-bookings/:id
Content-Type: application/json

{
  "recurrencePattern": "WEEKLY_MON_WED",
  "isActive": false
}
```

#### Delete (Deactivate)
```http
DELETE /recurring-bookings/:id
```

**Recurrence Patterns:**
- `DAILY` - Every day
- `WEEKLY_MON_WED_FRI` - Specific days
- `MONTHLY_1_15` - Specific dates

### 7.2 Availability Blocking

**What's Expected:**
- Calendar view with blocked times
- Create block form (one-time or recurring)
- List of blocks with delete option
- Visual indication on calendar

**Endpoints:**

#### Create Block
```http
POST /availability/block
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "startTime": "2024-12-14T00:00:00Z",
  "endTime": "2024-12-15T23:59:59Z",
  "isRecurring": true,
  "recurrencePattern": "WEEKLY_SAT_SUN",
  "reason": "Weekend unavailable"
}
```

#### List Blocks
```http
GET /availability
```

#### Delete Block
```http
DELETE /availability/:id
```

---

## UI Component Suggestions

### Recurrence Pattern Selector
```tsx
const RecurrenceSelector = () => {
  const [frequency, setFrequency] = useState('weekly');
  const [days, setDays] = useState([]);
  
  const generatePattern = () => {
    if (frequency === 'daily') return 'DAILY';
    if (frequency === 'weekly') return `WEEKLY_${days.join('_')}`;
    if (frequency === 'monthly') return `MONTHLY_${days.join('_')}`;
  };
  
  return (
    <div>
      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      {/* Day/Date picker based on frequency */}
    </div>
  );
};
```

### Rating Stars Component
```tsx
const RatingStars = ({ category, value, onChange }) => {
  return (
    <div>
      <label>{category}</label>
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star}
          filled={star <= value}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
};
```

---

## Authentication Flow

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
};

// Refresh token before expiry
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const data = await response.json();
  
  // Update tokens
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
};
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing Checklist

### Authentication
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Refresh token before expiry
- [ ] Forgot password flow
- [ ] Reset password with token
- [ ] Email verification

### Bookings
- [ ] Cancel booking with reason
- [ ] View cancellation fee
- [ ] Create recurring booking
- [ ] View generated bookings
- [ ] Edit recurring booking
- [ ] Delete recurring booking

### Reviews
- [ ] Create review with 5 categories
- [ ] Edit own review
- [ ] Delete own review
- [ ] Add response to review

### Location
- [ ] Add/remove favorite nanny
- [ ] View live location on map
- [ ] Receive geofence alerts

### Availability
- [ ] Create one-time block
- [ ] Create recurring block
- [ ] View blocks on calendar
- [ ] Delete block

### Admin
- [ ] View all users
- [ ] Verify/ban users
- [ ] View disputes
- [ ] Resolve disputes
- [ ] View payment stats
- [ ] Moderate reviews
- [ ] Update system settings
- [ ] View analytics

---

## Notes

- All authenticated endpoints require `Authorization: Bearer {access_token}` header
- All times are in UTC
- WebSocket connection: `ws://localhost:4000/location`
- Admin endpoints require `role: 'admin'`
