# Feature 2: User & Profile Management - Implementation Documentation

**Branch:** `feature/user-profile-management`  
**Status:** ✅ Complete  
**Date:** November 19, 2025

---

## Overview

This document details the implementation of Feature 2: User & Profile Management for the Care Connect backend. This feature enables CRUD operations for user profiles, supporting both Parent and Nanny user types with their specific data requirements.

---

## Architecture

### Database Schema

The feature leverages three main tables from the existing Prisma schema:

1. **`users`** - Core user authentication and role data
2. **`profiles`** - Common profile information (name, address, location, image)
3. **`nanny_details`** - Nanny-specific information (skills, experience, hourly rate, bio, availability)

### Module Structure

```
src/
├── prisma/
│   ├── prisma.module.ts       # Prisma module configuration
│   └── prisma.service.ts      # Prisma client service
├── users/
│   ├── dto/
│   │   └── update-user.dto.ts # Validation DTO for updates
│   ├── users.controller.ts    # HTTP endpoints
│   ├── users.service.ts       # Business logic
│   └── users.module.ts        # Module configuration
└── main.ts                    # Global validation pipe setup
```

---

## Implementation Details

### 1. Prisma Service Setup

**File:** `src/prisma/prisma.service.ts`

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Key Points:**
- Extends `PrismaClient` from generated client (`generated/prisma/client`)
- Implements lifecycle hooks for connection management
- Configured to read `DATABASE_URL` from environment variables
- Exported globally via `PrismaModule`

---

### 2. Users Service

**File:** `src/users/users.service.ts`

#### Methods Implemented:

##### `findOne(id: string)`
- Fetches user by ID with related `profiles` and `nanny_details`
- Throws `NotFoundException` if user doesn't exist
- Returns complete user object with nested relations

##### `update(id: string, updateUserDto: UpdateUserDto)`
- Updates profile information using `upsert` pattern
- Updates nanny details separately if provided
- Handles both Parent and Nanny user types
- Returns updated user with all relations

##### `uploadImage(id: string, fileUrl: string)`
- Updates profile image URL
- Uses `upsert` to handle cases where profile doesn't exist yet
- Returns updated profile

**Design Decisions:**
- Used `upsert` instead of `update` to handle cases where profile/nanny_details might not exist
- Separated profile and nanny_details updates for flexibility
- All updates return the complete user object for consistency

---

### 3. Users Controller

**File:** `src/users/users.controller.ts`

#### Endpoints:

| Method | Route | Description | Status |
|--------|-------|-------------|--------|
| GET | `/users/me` | Get current authenticated user | ⚠️ Requires Auth Guard |
| GET | `/users/:id` | Get user by ID | ✅ Working |
| PUT | `/users/:id` | Update user profile | ✅ Working |
| POST | `/users/upload-image` | Upload profile image | ✅ Working (URL-based) |

**Notes:**
- `/users/me` endpoint is implemented but requires authentication middleware (Feature 1)
- Image upload currently accepts URL strings (Cloudinary/S3 integration skipped as per requirements)

---

### 4. Data Validation

**File:** `src/users/dto/update-user.dto.ts`

```typescript
export class UpdateUserDto {
  @IsOptional() @IsString()
  firstName?: string;

  @IsOptional() @IsString()
  lastName?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsNumber()
  lat?: number;

  @IsOptional() @IsNumber()
  lng?: number;

  @IsOptional() @IsString()
  profileImageUrl?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  skills?: string[];

  @IsOptional() @IsNumber()
  experienceYears?: number;

  @IsOptional() @IsNumber()
  hourlyRate?: number;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsObject()
  availabilitySchedule?: any;
}
```

**Validation Features:**
- All fields are optional (partial updates supported)
- Type validation using `class-validator` decorators
- Array validation for skills
- Global validation pipe enabled in `main.ts`

---

### 5. Database Seeding

**File:** `prisma/seed.ts`

Creates two test users:

#### Parent User
- Email: `parent@example.com`
- Name: John Doe
- Phone: 1234567890
- Address: 123 Main St

#### Nanny User
- Email: `nanny@example.com`
- Name: Mary Poppins
- Phone: 0987654321
- Address: 456 Cherry Tree Lane
- Skills: First Aid, Cooking
- Experience: 5 years
- Hourly Rate: $20.00
- Availability: Monday & Tuesday 09:00-17:00

**Run Command:**
```bash
npx prisma db seed
```

---

## Testing

### E2E Test Suite

**File:** `test/users.e2e-spec.ts`

#### Test Coverage:

✅ **GET /users/:id Tests:**
- Should return parent profile with correct data
- Should return nanny profile with nanny_details
- Should return 404 for non-existent user

✅ **PUT /users/:id Tests:**
- Should update parent profile (name, address)
- Should update nanny details (hourly rate, skills)
- Should fail with 400 for invalid data types

**Test Results:**
```
Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Time:        2.578s
```

**Run Command:**
```bash
npm run test:e2e
```

---

## Configuration

### Environment Variables

**File:** `prisma.env`

```env
DATABASE_URL="postgresql://project_user:davanj123@localhost:5433/careconnect"
```

### App Module Configuration

**File:** `src/app.module.ts`

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'prisma.env',
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
  ],
  // ...
})
```

---

## API Examples

### Get User Profile

```bash
GET /users/8e7dab86-a5cb-4f67-915b-51ff96f89d82
```

**Response:**
```json
{
  "id": "8e7dab86-a5cb-4f67-915b-51ff96f89d82",
  "email": "nanny@example.com",
  "role": "nanny",
  "is_verified": true,
  "profiles": {
    "first_name": "Mary",
    "last_name": "Poppins",
    "phone": "0987654321",
    "address": "456 Cherry Tree Lane",
    "lat": null,
    "lng": null,
    "profile_image_url": null
  },
  "nanny_details": {
    "skills": ["First Aid", "Cooking"],
    "experience_years": 5,
    "hourly_rate": 20.00,
    "bio": "Experienced nanny who loves kids.",
    "availability_schedule": {
      "monday": ["09:00-17:00"],
      "tuesday": ["09:00-17:00"]
    }
  }
}
```

### Update User Profile

```bash
PUT /users/8e7dab86-a5cb-4f67-915b-51ff96f89d82
Content-Type: application/json

{
  "firstName": "Mary Jane",
  "hourlyRate": 25.50,
  "skills": ["First Aid", "Cooking", "Driving"]
}
```

**Response:**
```json
{
  "id": "8e7dab86-a5cb-4f67-915b-51ff96f89d82",
  "email": "nanny@example.com",
  "profiles": {
    "first_name": "Mary Jane",
    // ... other fields
  },
  "nanny_details": {
    "hourly_rate": 25.50,
    "skills": ["First Aid", "Cooking", "Driving"],
    // ... other fields
  }
}
```

### Upload Profile Image

```bash
POST /users/upload-image
Content-Type: application/json

{
  "userId": "8e7dab86-a5cb-4f67-915b-51ff96f89d82",
  "imageUrl": "https://example.com/images/profile.jpg"
}
```

---

## Known Limitations & Future Work

### Current Limitations:

1. **Authentication Not Integrated**
   - `/users/me` endpoint exists but requires auth guard from Feature 1
   - No user ownership validation on updates

2. **Image Upload**
   - Currently accepts URL strings only
   - Cloudinary/S3 integration skipped as per requirements
   - No file upload handling (multipart/form-data)

3. **Location Services**
   - Latitude/longitude stored but not validated
   - No geocoding integration yet (planned for Feature 3)

### Future Enhancements:

- [ ] Add authentication guards to protect endpoints
- [ ] Implement file upload with Cloudinary/S3
- [ ] Add geocoding for address → lat/lng conversion
- [ ] Add pagination for user listings
- [ ] Implement user search/filtering
- [ ] Add profile completeness validation
- [ ] Implement soft delete for users

---

## Git Commits

```
b2d40617 feat: complete user profile management with validation, tests, and seed data
d748b081 feat: enable global validation pipe
b7970a5c feat: implement user profile management (service, controller, prisma setup)
```

---

## Dependencies Added

```json
{
  "dependencies": {
    "class-validator": "^0.14.2",
    "class-transformer": "^0.5.1"
  }
}
```

---

## Troubleshooting

### Common Issues:

**1. Prisma Client Not Found**
```bash
# Solution: Generate Prisma Client
npx prisma generate
```

**2. Database Connection Error**
```bash
# Solution: Ensure PostgreSQL is running
docker ps | grep postgres

# Start if not running
docker-compose up -d
```

**3. UUID Extension Error**
```bash
# Solution: Enable UUID extension
docker exec -it care-connect-backend-db-1 psql -U project_user -d careconnect -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

**4. Tests Failing Due to Stale Data**
```bash
# Solution: Reset and reseed database
npx prisma db push
npx prisma db seed
```

---

## Conclusion

Feature 2 is fully implemented and tested. The user profile management system provides a solid foundation for both Parent and Nanny users, with proper validation, error handling, and comprehensive test coverage. The implementation is ready for integration with authentication (Feature 1) and location services (Feature 3).
