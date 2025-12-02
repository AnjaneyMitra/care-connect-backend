# Frontend Integration Guide - Complete Feature Set

This document provides comprehensive integration details for **all completed and partially implemented backend features** that require frontend implementation.

> **Note:** This guide includes both fully completed features (✅) and partially implemented features (⚠️) that have backend endpoints ready but may need additional work.

---

## Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization) ✅
2. [Service Request & Matching](#2-service-request--matching) ✅
3. [Booking System](#3-booking-system) ✅
4. [Admin Module](#4-admin-module) ✅
5. [Reviews & Ratings](#5-reviews--ratings) ✅
6. [Location & AI Features](#6-location--ai-features) ✅
7. [Scheduling & Availability](#7-scheduling--availability) ✅
8. [Partially Implemented Features](#8-partially-implemented-features) ⚠️
   - [Chat System](#81-chat-system)
   - [Notifications](#82-notifications)
   - [Bookings & Jobs](#83-bookings--jobs)
   - [User Profiles](#84-user-profiles)

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

---

## 8. Partially Implemented Features ⚠️

These features have backend implementations but may require additional work or have limitations.

### 8.1 Chat System

**Status:** Basic chat implemented, file uploads not yet supported

**What's Expected:**
- Real-time messaging between parent and nanny
- WebSocket connection for live updates
- Message history
- Typing indicators

**WebSocket Connection:**
```javascript
const socket = io('http://localhost:4000/chat');

// Join chat room
socket.emit('joinRoom', { bookingId: 'xxx' });

// Send message
socket.emit('sendMessage', {
  bookingId: 'xxx',
  content: 'Hello!'
});

// Receive messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Typing indicator
socket.emit('typing', { bookingId: 'xxx', isTyping: true });
socket.on('userTyping', (data) => {
  console.log('User typing:', data.userId);
});
```

**REST Endpoints:**
```http
GET /chat/:bookingId/messages
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "sender_id": "uuid",
    "content": "Hello!",
    "created_at": "2024-12-02T12:00:00.000Z"
  }
]
```

**Limitations:**
- ❌ File/image uploads not yet implemented
- ✅ Text messages work
- ✅ Real-time updates via WebSocket

---

### 8.2 Notifications

**Status:** Basic in-app notifications implemented, external channels (SMS/Email) not yet integrated

**What's Expected:**
- Notification list with unread count
- Mark as read functionality
- Real-time notification updates
- Different notification types (info, warning, success)

**Endpoints:**

#### Get Notifications
```http
GET /notifications
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "New Booking Request",
    "message": "You have a new booking request",
    "type": "info",
    "is_read": false,
    "created_at": "2024-12-02T12:00:00.000Z"
  }
]
```

#### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer {access_token}
```

#### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer {access_token}
```

**WebSocket for Real-time:**
```javascript
const socket = io('http://localhost:4000');

socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // Show toast/alert
});
```

**Limitations:**
- ❌ SMS notifications not implemented (requires Twilio)
- ❌ Email notifications not implemented (requires SendGrid/Resend)
- ✅ In-app notifications work
- ✅ Real-time updates via WebSocket

---

### 8.3 Bookings & Jobs

**Status:** Core booking system implemented, some advanced features available

**What's Expected:**
- Create/view/update bookings
- Job postings by parents
- Nanny applications to jobs
- Booking status management

**Endpoints:**

#### Create Booking
```http
POST /bookings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "nannyId": "uuid",
  "startTime": "2024-12-10T09:00:00Z",
  "endTime": "2024-12-10T13:00:00Z",
  "numChildren": 2,
  "specialRequirements": "Allergy to peanuts"
}
```

#### Get Bookings
```http
GET /bookings
GET /bookings/:id
```

#### Update Booking Status
```http
PUT /bookings/:id/status
Content-Type: application/json

{
  "status": "CONFIRMED"  // or "COMPLETED", "CANCELLED"
}
```

#### Job Postings
```http
POST /jobs
GET /jobs
GET /jobs/:id
PUT /jobs/:id
DELETE /jobs/:id
```

#### Apply to Job
```http
POST /jobs/:id/apply
Authorization: Bearer {access_token}
```

**Available Features:**
- ✅ Booking creation and management
- ✅ Job postings
- ✅ Applications to jobs
- ✅ Status updates
- ✅ Cancellation with fees
- ✅ Review prompts after completion

---

### 8.4 User Profiles

**Status:** Profile management implemented, image upload not yet integrated

**What's Expected:**
- View/edit user profile
- Nanny-specific details (experience, skills, hourly rate)
- Parent-specific details
- Profile completeness indicator

**Endpoints:**

#### Get Profile
```http
GET /users/profile
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "nanny",
  "is_verified": true,
  "profiles": {
    "full_name": "Jane Smith",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "lat": 40.7128,
    "lng": -74.0060,
    "bio": "Experienced nanny..."
  },
  "nanny_details": {
    "experience_years": 5,
    "hourly_rate": 25.00,
    "skills": ["First Aid", "Cooking", "Tutoring"],
    "certifications": ["CPR Certified"],
    "languages": ["English", "Spanish"]
  }
}
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "phone": "+1234567890",
  "bio": "Updated bio..."
}
```

#### Update Nanny Details
```http
PUT /users/nanny-details
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "experience_years": 6,
  "hourly_rate": 30.00,
  "skills": ["First Aid", "Cooking", "Tutoring", "Music"]
}
```

**Limitations:**
- ❌ Profile image upload not implemented (requires Cloudinary/S3)
- ✅ All text fields work
- ✅ Location (lat/lng) can be set
- ✅ Nanny-specific details fully functional

---

### 8.5 Assignments & Matching

**Status:** Fully implemented

**What's Expected:**
- View assigned service requests
- Accept/reject assignments
- Automatic timeout after deadline

**Endpoints:**

#### Get My Assignments
```http
GET /assignments
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "request_id": "uuid",
    "nanny_id": "uuid",
    "status": "pending",
    "response_deadline": "2024-12-02T12:15:00.000Z",
    "rank_position": 1,
    "service_requests": {
      "date": "2024-12-10",
      "start_time": "09:00:00",
      "num_children": 2
    }
  }
]
```

#### Accept Assignment
```http
POST /assignments/:id/accept
Authorization: Bearer {access_token}
```

#### Reject Assignment
```http
POST /assignments/:id/reject
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Not available at that time"
}
```

**Features:**
- ✅ Assignment creation via matching algorithm
- ✅ Accept/reject functionality
- ✅ Automatic timeout (15 minutes default)
- ✅ Rank-based assignment (best match first)
- ✅ Favorites boost (+50 points)
- ✅ AI scoring (+30 points)

---

## Implementation Priority

### High Priority (Fully Functional)
1. ✅ Authentication & Authorization
2. ✅ Bookings & Cancellations
3. ✅ Reviews & Ratings
4. ✅ Admin Module
5. ✅ Recurring Bookings
6. ✅ Availability Blocking
7. ✅ Favorites & Location Tracking

### Medium Priority (Partially Implemented)
1. ⚠️ Chat System (text only, no file uploads)
2. ⚠️ Notifications (in-app only)
3. ⚠️ User Profiles (no image upload)
4. ✅ Assignments & Matching

### Low Priority (Not Yet Implemented)
1. ❌ Payment Gateway Integration
2. ❌ SMS/Email Notifications
3. ❌ Profile Image Upload
4. ❌ File Uploads in Chat

---

## Quick Start Checklist

### Essential Features (Start Here)
- [ ] Implement authentication (login, register, refresh token)
- [ ] Create booking flow (create, view, cancel)
- [ ] Build nanny browse/search page
- [ ] Implement chat interface (text only)
- [ ] Add notifications UI
- [ ] Create user profile pages

### Advanced Features (After Essentials)
- [ ] Implement recurring bookings
- [ ] Add availability calendar for nannies
- [ ] Build admin dashboard
- [ ] Add live location tracking
- [ ] Implement favorites system
- [ ] Create review/rating interface

### Future Enhancements
- [ ] Add payment gateway
- [ ] Implement file uploads (chat, profiles)
- [ ] Add SMS/email notifications
- [ ] Integrate calendar sync

---

## Notes

- All authenticated endpoints require `Authorization: Bearer {access_token}` header
- All times are in UTC
- WebSocket connections:
  - Chat: `ws://localhost:4000/chat`
  - Location: `ws://localhost:4000/location`
  - Notifications: `ws://localhost:4000` (default namespace)
- Admin endpoints require `role: 'admin'`
- File uploads will require additional backend work (Cloudinary/S3 integration)
