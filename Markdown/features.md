#backend only , no frontend

# Care Connect - On-Demand Nanny Matching Platform

## 🎯 System Architecture Overview

**Model**: On-Demand Auto-Matching (Similar to Uber/Lyft)

**Core Workflow**:
1. **Parent** creates a service request (date, time, duration, location, requirements)
2. **System** automatically finds and ranks available nannies based on:
   - Proximity (within configurable radius)
   - Availability for requested time slot
   - Skills matching requirements
   - Rating and experience
   - Hourly rate
3. **System** auto-assigns request to the best-matched nanny
4. **Nanny** receives instant notification and has limited time to accept/reject
5. **If accepted**: Booking is automatically created → Service proceeds
6. **If rejected/timeout**: System auto-assigns to next best match
7. **Process repeats** until a nanny accepts or no more matches available

**Key Differences from Traditional Job Board**:
- ❌ No manual job posting by parents
- ❌ No browsing/applying by nannies
- ✅ Instant automated matching
- ✅ Quick acceptance/rejection flow
- ✅ Automatic re-assignment on rejection
- ✅ Optimized for speed and convenience

---

📁 1. Authentication & Authorization
Features

Google OAuth signup/login

Login with JWT authentication

Refresh token rotation

Role-based access (Parent, Nanny, Admin)

Password hashing

Account verification (email/SMS)

Forgot/Reset password flow

Protect routes with Guards

Endpoints

POST /auth/signup

POST /auth/login

# POST /auth/refresh-token

POST /auth/forgot-password

POST /auth/reset-password

👤 2. User & Profile Management
Features

Parent profile CRUD

Nanny profile CRUD

Address & location storage (lat/lng)

Skills, experience, hourly rate

Verification status

Upload profile image (Cloudinary/S3) - skip for now

Availability schedule

Endpoints

GET /users/:id

PUT /users/:id

POST /users/upload-image

GET /users/me

📍 3. Location & Geo Matching
Features

Store latitude & longitude for all users

Convert address → coordinates (Google Geocoding API)

Find nearby nannies within X km

Sort by distance (Haversine / PostGIS)

Geo-indexing for optimized search

Endpoints

GET /nannies/nearby?lat=&lng=&radius=

GET /jobs/nearby?lat=&lng=&radius=

📄 4. Service Request & Auto-Matching System
Features

Parent creates service request with:
  - Date/time needed
  - Duration (hours)
  - Number of children
  - Special requirements/notes
  - Location (auto-filled from profile)

Smart matching algorithm:
  - Find nannies within radius (e.g., 10km)
  - Check availability for requested time slot
  - Filter by skills/experience if specified
  - Sort by: distance, rating, hourly rate
  - Auto-assign to best match

Auto-assignment workflow:
  - System assigns request to top-ranked available nanny
  - Nanny receives instant notification
  - Nanny has X minutes to accept/reject (configurable timeout)
  - If rejected or timeout → auto-assign to next best nanny
  - Continue until accepted or no more matches

Request status tracking:
  - PENDING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED → CANCELLED

Parent can cancel request before acceptance

View request history and current assignments

Endpoints

POST /requests - Create new service request

GET /requests/:id - Get request details

GET /requests/parent/:parentId - Get all parent's requests

PUT /requests/:id/cancel - Cancel pending request

GET /requests/:id/matches - View potential matches (for transparency)

🧑‍🏫 5. Nanny Assignment Management
Features

Nanny receives assignment notifications:
  - Push notification
  - Email alert
  - In-app notification badge

View assigned request details:
  - Parent information
  - Children count and ages
  - Location and distance
  - Date/time and duration
  - Offered rate (based on nanny's hourly rate)

Accept or reject assignment:
  - Accept → creates confirmed booking
  - Reject → triggers re-assignment to next nanny
  - Timeout (no response) → auto-reject and re-assign

Rejection reasons (optional):
  - Not available
  - Too far
  - Rate too low
  - Other

View assignment history

Track acceptance rate (for nanny performance metrics)

Endpoints

GET /assignments/nanny/:nannyId - Get all assignments for nanny

GET /assignments/:id - Get assignment details

PUT /assignments/:id/accept - Accept assignment

PUT /assignments/:id/reject - Reject assignment (with optional reason)

GET /assignments/pending - Get pending assignments requiring action

📅 6. Booking System
Features

Booking automatically created when nanny accepts assignment

Booking lifecycle:
  - CONFIRMED → IN_PROGRESS → COMPLETED → CANCELLED

Parent can view booking details:
  - Assigned nanny information
  - Service date/time and duration
  - Total cost calculation
  - Nanny contact info (revealed after confirmation)

Nanny can view booking details:
  - Parent information
  - Children details
  - Location and directions
  - Expected earnings

Start/End service tracking:
  - Nanny marks service as started (IN_PROGRESS)
  - Nanny marks service as completed
  - Actual duration tracked for payment

Cancellation policies:
  - Parent can cancel (with potential fee if last minute)
  - Nanny can cancel (triggers re-assignment)
  - Auto-cancel if nanny doesn't show up

Service completion:
  - Both parties confirm completion
  - Triggers payment release
  - Opens review period

Endpoints

GET /bookings/:id - Get booking details

GET /bookings/parent/:parentId - Get all parent's bookings

GET /bookings/nanny/:nannyId - Get all nanny's bookings

PUT /bookings/:id/start - Mark service as started (nanny only)

PUT /bookings/:id/complete - Mark service as completed

PUT /bookings/:id/cancel - Cancel booking (with reason)

GET /bookings/active - Get currently active bookings

💬 7. Messaging System (Real-Time Chat)
Features

Chat room created when booking starts

Store messages in DB

WebSockets for real-time messaging

Message read/unread tracking

Attachments (images)

Pagination of messages

Tables

chats

messages

WebSocket Events

message:send

message:receive

message:read

Endpoints

GET /chat/:chatId/messages

POST /chat/:chatId/message

💳 8. Payments & Payouts (Marketplace)
Features

Parent pays at booking (escrow)

Payment gateways: Stripe Connect or Razorpay Route

Platform holds funds

Commission deduction

Automated payout to nanny

Refunds/cancellations

Webhooks to validate payment status

Invoice & receipt generation

Endpoints

POST /payments/charge

POST /payments/webhook

POST /payouts/release

GET /payments/booking/:id

⭐ 9. Reviews & Ratings
Features

Parent leaves rating after service completed

Nanny can also rate parent (bidirectional)

Rating average auto-updated for both users

Review linked to specific booking

Review moderation (admin)

Edit/delete review (within allowed policy - e.g., 24 hours)

Rating categories:
  - Overall rating (1-5 stars)
  - Punctuality
  - Professionalism
  - Care quality
  - Communication

Endpoints

POST /reviews - Create review after booking completion

GET /reviews/nanny/:id - Get all reviews for a nanny

GET /reviews/parent/:id - Get all reviews for a parent

GET /reviews/booking/:bookingId - Get review for specific booking

PUT /reviews/:id - Edit review (within allowed timeframe)

DELETE /reviews/:id - Delete review (admin only)

🛡️ 10. Admin Module
Features

Manage users (ban, suspend, verify)

View all service requests & bookings

View assignment history and metrics

Resolve disputes

Monitor payments & payouts

Review moderation

Matching algorithm configuration:
  - Adjust matching radius
  - Set assignment timeout duration
  - Configure re-assignment rules

Analytics dashboard (optional):
  - Request completion rate
  - Average assignment acceptance rate per nanny
  - Popular service times
  - Revenue metrics

Endpoints

GET /admin/users

GET /admin/requests

GET /admin/assignments

GET /admin/bookings

GET /admin/payments

PUT /admin/settings/matching - Update matching algorithm settings

🔔 11. Notifications System
Features

Push notifications (FCM)

Email notifications (Resend/SendGrid)

SMS alerts (optional – Twilio/MSG91)

Notifications for:

Service request created (parent confirmation)

Assignment sent to nanny (nanny alert)

Assignment accepted (parent notification)

Assignment rejected (parent notification - reassigning)

Booking confirmed (both parties)

Service starting soon (reminder - 1 hour before)

Service started (parent notification)

Service completed (both parties)

Payment completed (both parties)

Message received (both parties)

Cancellation alerts (both parties)

Re-assignment in progress (parent notification)

Endpoints

POST /notifications/send

🧩 12. System Integrations
Google Maps APIs:

Geocoding API

Places Autocomplete

Distance Matrix (later)

Cloud Uploads:

Cloudinary / AWS S3

Payment Gateway:

Stripe Connect (global)

Razorpay Route (India)

🧹 13. Security Features

Rate limiting

CORS protection

Input validation & DTOs

SQL injection protection

JWT signature validation

Sensitive data encryption

Sanitization middleware

Audit logs for payments

🧪 14. Testing & Reliability
Types:

Unit tests (Jest)

E2E tests (Supertest)

API contract tests

Load testing (k6)

Error monitoring (Sentry)

🏗️ 15. Deployment Infrastructure
Recommended:

Backend → Railway / Render / AWS

Database → Supabase / Railway Postgres

WebSockets → Socket.io

CI/CD → GitHub Actions

Dockerized backend (optional)