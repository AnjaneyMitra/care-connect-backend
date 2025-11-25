# Care Connect Backend - V1.0.0

<p align="center">
  <strong>A comprehensive NestJS-based backend API for connecting parents with qualified nannies</strong>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-api-endpoints">API Endpoints</a>
</p>

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start database
docker-compose up -d

# Create schema and seed data
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -f schema.sql
npx prisma db seed

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:4000`.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**Frontend Integration Guide**](./docs/FRONTEND_INTEGRATION.md) | **START HERE** - Complete guide for frontend developers |
| [**API Reference**](./docs/API.md) | All endpoints, parameters, and responses |
| [**Type Definitions**](./docs/TYPES.md) | TypeScript interfaces for your Next.js app |
| [**Environment Setup**](./docs/ENV_SETUP.md) | Required environment variables |
| [**Setup Guide**](./docs/SETUP.md) | Detailed setup instructions |
| [**Testing Guide**](./Markdown/TESTING.md) | Database setup, seed data, and running tests |

## ✨ Features

### V1.0.0 - Fully Implemented

#### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based session management
- **Email/Password Authentication**: Traditional signup and login
- **Google OAuth 2.0**: One-click social login with automatic user creation
- **Protected Routes**: JWT strategy guards for sensitive endpoints
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Role-Based Access Control**: Parent, Nanny, and Admin roles

#### 👤 User & Profile Management
- **Dual User Roles**: 
  - **Parent**: Create service requests and manage bookings
  - **Nanny**: Receive assignments and manage availability
  - **Admin**: System administration and oversight
- **Comprehensive Profiles**:
  - Personal information (name, phone, address)
  - Geographic coordinates for location-based matching
  - Profile images (URL-based)
  - Email verification status
- **Nanny Professional Details**:
  - Skills array (CPR, First Aid, Early Childhood Education, etc.)
  - Years of experience
  - Hourly rate (INR)
  - Professional bio
  - Weekly availability schedule

#### 📍 Location-Based Services
- **Address Geocoding**: Convert addresses to coordinates using Google Maps API
- **Nearby Nanny Search**: Find nannies within specified radius (Haversine formula)
- **Nearby Job Search**: Find job postings by location
- **Smart Filtering**: Distance-sorted results with proximity data

#### 🎯 Service Request & Auto-Matching System
- **On-Demand Requests**: Parents create service requests with date, time, and requirements
- **Intelligent Matching Algorithm**:
  - Hard filters: Location radius, hourly rate, required skills
  - Weighted scoring: Distance (40%), experience (30%), acceptance rate (20%), rate (10%)
  - Automatic nanny assignment based on optimal match
- **Assignment Management**: Nannies can accept or reject assignments
- **Automatic Booking Creation**: Confirmed bookings created upon assignment acceptance

#### 📅 Booking System
- **Dual Booking Flows**:
  - **Direct Booking**: Parents directly book specific nannies
  - **Auto-Matching**: System finds and assigns optimal nanny
- **Booking Management**: 
  - Status tracking (CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
  - Start/complete/cancel operations
  - Role-based access control
- **Booking Retrieval**: Get bookings by parent, nanny, or active status

#### 💬 Real-Time Messaging
- **Chat System**: Booking-linked chat rooms
- **WebSocket Support**: Real-time message delivery via Socket.io
- **Message Features**:
  - Text messages with optional attachments
  - Message history with pagination
  - Typing indicators
  - Read receipts
- **HTTP Fallback**: REST API for message sending

#### ⭐ Reviews & Ratings
- **Post-Booking Reviews**: Rate and review after completed bookings
- **Star Ratings**: 1-5 star rating system
- **Review Comments**: Detailed feedback
- **Public Reviews**: View reviews for any user
- **Bidirectional**: Both parents and nannies can leave reviews

#### 🔔 Notifications System
- **Multi-Channel Support**:
  - Email notifications
  - Push notifications
  - SMS notifications
- **Event-Driven**: Automatic notifications for key events
- **Manual Triggers**: Admin/testing notification endpoint

#### 🛡️ Admin Module
- **User Management**:
  - View all users
  - Verify user accounts
  - Ban/unban users
- **Booking Oversight**: View all bookings in the system
- **System Statistics**: User counts, booking metrics, active bookings
- **Protected Access**: AdminGuard ensures only admins can access

#### 🔒 Security & Data Protection
- **CORS Configuration**: Configurable for development and production
- **Sensitive Data Exclusion**: Passwords, tokens never exposed in responses
- **Input Validation**: class-validator for request validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Authentication**: JWT, Passport.js, bcrypt
- **OAuth**: Google OAuth 2.0
- **Real-Time**: Socket.io
- **Validation**: class-validator, class-transformer
- **Maps**: Google Maps Geocoding API
- **Testing**: Jest (E2E and Unit tests)

## 📊 Database Schema

### Core Tables
- **users**: Authentication and account data
- **profiles**: Extended user information
- **nanny_details**: Nanny professional information
- **service_requests**: Parent service requests
- **assignments**: Nanny assignments from auto-matching
- **bookings**: Confirmed bookings
- **chats**: Chat rooms linked to bookings
- **messages**: Chat messages
- **reviews**: User reviews and ratings
- **jobs**: Job postings (legacy, optional)
- **applications**: Job applications (legacy, optional)

All tables include UUID primary keys, timestamps, and proper foreign key relationships.

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback

### Users
- `GET /users/me` - Get current user profile (protected)
- `GET /users/nannies` - Get all nannies
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `POST /users/upload-image` - Upload profile image

### Location Services
- `GET /location/nannies/nearby` - Find nearby nannies
- `GET /location/jobs/nearby` - Find nearby jobs
- `POST /location/geocode` - Convert address to coordinates

### Service Requests
- `POST /requests` - Create service request (triggers auto-matching)
- `GET /requests/parent/me` - Get my service requests
- `GET /requests/:id` - Get request details

### Assignments
- `GET /assignments/nanny/me` - Get my assignments
- `GET /assignments/pending` - Get pending assignments
- `GET /assignments/:id` - Get assignment details
- `PUT /assignments/:id/accept` - Accept assignment (creates booking)
- `PUT /assignments/:id/reject` - Reject assignment

### Bookings
- `POST /bookings` - Create direct booking
- `GET /bookings/active` - Get active bookings
- `GET /bookings/parent/me` - Get my bookings (parent)
- `GET /bookings/nanny/me` - Get my bookings (nanny)
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id/start` - Start booking
- `PUT /bookings/:id/complete` - Complete booking
- `PUT /bookings/:id/cancel` - Cancel booking

### Chat
- `POST /chat` - Create chat room
- `GET /chat/booking/:bookingId` - Get chat by booking
- `GET /chat/:chatId/messages` - Get message history
- `POST /chat/:chatId/message` - Send message

### Reviews
- `POST /reviews` - Create review
- `GET /reviews/user/:userId` - Get user reviews
- `GET /reviews/booking/:bookingId` - Get booking review

### Notifications
- `POST /notifications/send` - Send notification (admin/testing)

### Admin
- `GET /admin/users` - Get all users (admin only)
- `GET /admin/bookings` - Get all bookings (admin only)
- `GET /admin/stats` - Get system statistics (admin only)
- `PUT /admin/users/:id/verify` - Verify user (admin only)
- `PUT /admin/users/:id/ban` - Ban user (admin only)

**📖 For complete API documentation, see [API.md](./docs/API.md)**

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**📖 For detailed testing instructions, see [TESTING.md](./Markdown/TESTING.md)**

## 🌐 CORS Configuration

The backend accepts requests from:
- **Development**: `http://localhost:3000` (Next.js default)
- **Production**: Set via `FRONTEND_URL` environment variable

## 🚧 Future Enhancements

- Email verification flow
- Password reset functionality
- Payment processing (Stripe/Razorpay)
- Advanced search filters
- Notification preferences
- In-app notifications
- File upload for profile images
- Multi-language support

## 📝 Version History

### V1.0.0 (November 25, 2025)
- ✅ Complete authentication system with OAuth
- ✅ User and profile management
- ✅ Location-based services
- ✅ Service request auto-matching system
- ✅ Assignment management for nannies
- ✅ Comprehensive booking system
- ✅ Real-time chat with Socket.io
- ✅ Reviews and ratings
- ✅ Notification system
- ✅ Admin module
- ✅ Full API documentation
- ✅ E2E and unit tests

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ using NestJS**
