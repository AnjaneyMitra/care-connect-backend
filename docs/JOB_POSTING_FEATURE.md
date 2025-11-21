# Job Posting & Management Feature Implementation

## Overview
Implemented the complete job posting and management system for parents to create, view, update, and delete babysitting job postings.

## Completed Date
November 20, 2025

---

## Features Implemented

### 1. Job Creation
- Parents can create job postings with:
  - Title and description
  - Date and time
  - Location (latitude/longitude from Google Maps)
  - Automatic status initialization (default: "open")

### 2. Job Management
- **View Job Details**: Get complete job information including parent profile and all applications
- **Parent Dashboard**: View all jobs created by a specific parent
- **Update Jobs**: Parents can edit their own job postings
- **Cancel Jobs**: Soft delete with status change to "cancelled"

### 3. View Applications
- Parents can view all nannies who applied to their jobs
- Includes nanny profiles and details (skills, experience, rates)

### 4. Security & Validation
- JWT authentication required for all endpoints
- Ownership verification (parents can only edit/delete their own jobs)
- Input validation using class-validator
- Proper error handling with HTTP status codes

---

## API Endpoints

### Create Job
```
POST /jobs
Authorization: Bearer {jwt_token}
Body: {
  "title": "Need babysitter for 2 kids",
  "description": "Looking for experienced nanny",
  "date": "2025-12-01",
  "time": "10:00:00",
  "location_lat": 40.7128,
  "location_lng": -74.0060
}
```

### Get Job Details
```
GET /jobs/:id
Authorization: Bearer {jwt_token}
```
Returns job with parent info and all applications.

### Get Parent's Jobs (Dashboard)
```
GET /jobs/parent/:parentId
Authorization: Bearer {jwt_token}
```
Returns all jobs created by the parent, ordered by creation date.

### Update Job
```
PATCH /jobs/:id
Authorization: Bearer {jwt_token}
Body: {
  "title": "Updated title",
  "status": "closed"
}
```
Only the job owner can update.

### Delete/Cancel Job
```
DELETE /jobs/:id
Authorization: Bearer {jwt_token}
```
Soft delete - sets status to "cancelled".

### View Applied Nannies
```
GET /jobs/:id/applications
Authorization: Bearer {jwt_token}
```
Returns all nannies who applied with their profiles and details.

---

## Technical Implementation

### File Structure
```
src/jobs/
├── dto/
│   ├── create-job.dto.ts       # Validation for job creation
│   └── update-job.dto.ts       # Validation for job updates
├── jobs.controller.ts          # HTTP endpoints
├── jobs.controller.spec.ts     # Controller tests
├── jobs.service.ts             # Business logic
├── jobs.service.spec.ts        # Service tests
└── jobs.module.ts              # Module configuration
```

### DTOs (Data Transfer Objects)

**CreateJobDto**
- `title`: string (5-255 chars, required)
- `description`: string (optional)
- `date`: ISO date string (required)
- `time`: time string (required)
- `location_lat`: number (required)
- `location_lng`: number (required)

**UpdateJobDto**
- All fields from CreateJobDto (optional)
- `status`: enum ["open", "closed", "cancelled", "hired"]

### Service Methods

1. **create(createJobDto, parentId)**: Create new job
2. **findOne(id)**: Get job by ID with relations
3. **findByParent(parentId)**: Get all parent's jobs
4. **update(id, updateJobDto, userId)**: Update job with ownership check
5. **remove(id, userId)**: Soft delete job with ownership check
6. **getApplications(jobId)**: Get all applications for a job

### Database Relations
Jobs automatically include:
- Parent user profile
- All applications with nanny profiles
- Nanny details (skills, experience, hourly rate)

---

## Testing

### Test Coverage
- **14 tests** specifically for jobs module
- **21 total tests** passing across entire application
- Test files:
  - `jobs.service.spec.ts`: 7 tests
  - `jobs.controller.spec.ts`: 7 tests

### Test Scenarios
- ✅ Job creation
- ✅ Find job by ID
- ✅ Handle not found errors
- ✅ Update jobs with ownership verification
- ✅ Reject unauthorized updates
- ✅ Soft delete jobs
- ✅ Retrieve applications

---

## Dependencies Added
```json
{
  "@nestjs/mapped-types": "^2.x.x"
}
```

---

## Security Features

### Authentication
- All endpoints protected with JWT guard
- User ID extracted from JWT token

### Authorization
- Ownership checks in service layer
- Parents can only modify their own jobs
- Throws `ForbiddenException` for unauthorized access

### Validation
- Input validation using `class-validator`
- Type safety with TypeScript
- DTO validation on all requests

---

## Error Handling

### HTTP Status Codes
- `200 OK`: Successful requests
- `201 Created`: Job created successfully
- `404 Not Found`: Job doesn't exist
- `403 Forbidden`: Not job owner
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid/missing JWT

### Error Messages
- Clear, descriptive error messages
- Proper exception types (`NotFoundException`, `ForbiddenException`)

---

## Integration with Other Modules

### PrismaModule
- Uses PrismaService for database operations
- Includes relations automatically

### AuthModule
- JWT authentication via `AuthGuard('jwt')`
- User context from request object

---

## Future Enhancements (Not Yet Implemented)

1. **Matching Algorithm**: Automatically match jobs to suitable nannies
2. **Auto-notifications**: Notify nearby nannies when jobs are posted
3. **Auto-close**: Jobs automatically close after hiring
4. **Role-based Guards**: Explicit parent-only guard decorator
5. **Job Search**: Filter and search jobs by location, date, etc.
6. **Pagination**: For large job lists

---

## Database Schema Used

### `jobs` Table
```prisma
model jobs {
  id           String   @id @default(uuid)
  parent_id    String?
  title        String
  description  String?
  date         DateTime
  time         DateTime
  location_lat Decimal?
  location_lng Decimal?
  status       String?  @default("open")
  created_at   DateTime?
  updated_at   DateTime?
  applications applications[]
  bookings     bookings[]
  users        users?   @relation(fields: [parent_id])
}
```

---

## Git Commit
```
feat: Add job posting and management feature

- Created JobsModule with CRUD operations
- POST /jobs - Create job with location (parent only)
- GET /jobs/:id - Get job details with applications
- GET /jobs/parent/:parentId - Parent's job dashboard
- PATCH /jobs/:id - Update job (owner only)
- DELETE /jobs/:id - Cancel job (soft delete)
- GET /jobs/:id/applications - View applied nannies
- Added DTOs with validation (CreateJobDto, UpdateJobDto)
- Implemented ownership checks in service layer
- Full test coverage (14 tests passing)
- Auto-includes related data (parent profile, applications, nanny details)
```

---

## Notes

- Location coordinates come from Google Maps API on the frontend
- Jobs use soft delete (status change) rather than hard delete
- All timestamps managed by database defaults
- Ready for next phase: Job Applications (Nanny Side)
