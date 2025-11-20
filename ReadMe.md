<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Care Connect Backend

A NestJS-based backend API for the Care Connect platform - connecting parents with qualified nannies.

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

## 🔑 Key Features

### ✅ Implemented Features

#### 1. Authentication & Authorization
- **JWT-based Authentication**: Secure token-based session management
- **Email/Password Authentication**: Traditional signup and login
- **Google OAuth 2.0 Integration**: One-click social login
  - Automatic user creation on first OAuth login
  - OAuth tokens securely stored in database
  - Seamless JWT token generation after OAuth
- **Protected Routes**: JWT strategy guards for sensitive endpoints
- **Password Security**: Bcrypt hashing with salt rounds
- **User Verification**: Database fields ready for email verification (not yet implemented)
- **Password Reset**: Database fields ready for password reset flow (not yet implemented)

#### 2. User & Profile Management
- **Dual User Roles**: 
  - **Parent**: Can post jobs and book nannies
  - **Nanny**: Can apply to jobs and offer services
  - **Admin**: Reserved for future admin features
- **Comprehensive User Profiles**:
  - Personal information (name, phone, address)
  - Geographic coordinates for location-based matching
  - Profile image support (URL-based)
  - Email verification status
  - OAuth provider information
- **Nanny-Specific Details**:
  - Skills array (e.g., "CPR Certified", "First Aid", "Early Childhood Education")
  - Years of experience
  - Hourly rate (INR)
  - Professional bio
  - Weekly availability schedule (JSON format)
- **Profile Update API**: Update user and profile information
- **Profile Image Upload**: Upload/update profile images via URL
- **Authenticated Profile Access**: GET /users/me endpoint with JWT protection

#### 3. Location-Based Services
- **Address Geocoding**: 
  - Convert physical addresses to coordinates using Google Maps API
  - Accurate lat/lng for location-based searches
- **Nearby Nanny Search**:
  - Find nannies within specified radius (default: 10km)
  - Haversine formula for accurate distance calculation
  - Returns complete nanny profiles with skills, experience, and availability
  - Results sorted by proximity
  - Distance included in response (km)
- **Nearby Job Search**:
  - Find job postings within specified radius
  - Includes parent contact information
  - Sorted by distance from search location
  - Distance included in response (km)
- **Smart Data Filtering**:
  - Only returns users/jobs with valid coordinates
  - Excludes sensitive data from responses
- **Query Parameters**:
  - Flexible radius configuration
  - Support for any lat/lng coordinates

#### 4. Security & Data Protection
- **CORS Configuration**:
  - Enabled for Next.js frontend (localhost:3000)
  - Credentials support for JWT cookies
  - Configurable for production environments
- **Sensitive Data Exclusion**:
  - Password hashes never returned in API responses
  - OAuth tokens excluded from user objects
  - Verification and reset tokens protected
- **Password Validation**:
  - Minimum length requirements
  - Secure storage with bcrypt
- **JWT Token Management**:
  - Configurable expiry via environment variables
  - Bearer token authentication
  - Passport.js integration

### 📊 Database Schema

#### Core Tables
- **users**: Main user account table with authentication data
  - OAuth support fields (provider, provider_id, access_token, refresh_token)
  - Verification and password reset token fields
- **profiles**: Extended user information (name, contact, location, image)
- **nanny_details**: Nanny-specific professional information
- **jobs**: Job postings created by parents
- **applications**: Nanny applications to jobs
- **bookings**: Confirmed bookings between parents and nannies
- **chats**: Chat rooms linked to bookings
- **messages**: Individual messages within chats
- **reviews**: Reviews and ratings between users
- **payments**: Payment records for completed bookings

All tables include:
- UUID primary keys
- Timestamps (created_at, updated_at)
- Proper foreign key relationships with cascade deletes
- Check constraints for data integrity

### 🚧 Planned Features (Database Ready)

The database schema supports these features, but API endpoints are not yet implemented:

#### Jobs & Applications
- Create, update, delete job postings
- Nanny application system
- Application status management (applied, accepted, rejected)
- Job search and filtering

#### Bookings & Scheduling
- Create bookings from accepted applications
- Booking status management (requested, confirmed, cancelled, completed)
- Start time and end time tracking
- Booking conflict detection

#### Real-time Messaging
- Chat creation for active bookings
- Send and receive messages
- Message read status tracking
- File attachments support
- Real-time updates (WebSocket integration needed)

#### Payments
- Payment processing integration
- Transaction ID tracking
- Payment status management
- Payment history for users
- Stripe/Razorpay integration (planned)

#### Reviews & Ratings
- Post-booking review system
- Star ratings (1-5)
- Review comments
- Bidirectional reviews (parent ↔ nanny)
- Average rating calculation

#### Email Verification
- Send verification emails on signup
- Token-based email verification
- Resend verification emails
- Verified user badge

#### Password Reset
- Request password reset via email
- Secure token-based reset flow
- Token expiry management
- Password strength validation

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Authentication**: JWT, Passport.js, bcrypt
- **OAuth**: Google OAuth 2.0
- **Validation**: class-validator, class-transformer
- **Maps**: Google Maps Geocoding API
- **Testing**: Jest (E2E and Unit tests)

## 🧪 Run Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

```

**📖 For detailed testing instructions, database setup, and seed data information, see [TESTING.md](./Markdown/TESTING.md)**

## 📡 API Endpoints Overview

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback

### Users
- `GET /users/me` - Get current user profile (protected)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `POST /users/upload-image` - Upload profile image

### Location Services
- `GET /location/nannies/nearby` - Find nearby nannies
- `GET /location/jobs/nearby` - Find nearby jobs
- `POST /location/geocode` - Convert address to coordinates

**📖 For complete API documentation, see [API.md](./docs/API.md)**

## 🌐 CORS Configuration

The backend is configured to accept requests from:
- **Development**: `http://localhost:3000` (Next.js default)
- **Production**: Set via `FRONTEND_URL` environment variable

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
