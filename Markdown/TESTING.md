# Testing Guide - Care Connect Backend

This guide explains how to set up the database, seed test data, and run tests for the Care Connect backend.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Seeding Test Data](#seeding-test-data)
- [Running Tests](#running-tests)
- [Test Data Overview](#test-data-overview)
- [Troubleshooting](#troubleshooting)
- [Updating This Guide](#updating-this-guide)

---

## Prerequisites

Before running tests, ensure you have:

1. **Docker** installed and running
2. **Node.js** (v18 or higher)
3. **Dependencies** installed: `npm install`
4. **Environment file** configured (`.env`)

### Environment Setup

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Minimum required variables for testing:
```env
DATABASE_URL="postgresql://project_user:davanj123@localhost:5433/careconnect"
POSTGRES_USER=project_user
POSTGRES_PASSWORD=davanj123
POSTGRES_DB=careconnect
PORT=3000
JWT_SECRET=test_secret_for_development
```

---

## Database Setup

### Step 1: Start PostgreSQL Database

Start the database using Docker Compose:

```bash
docker-compose up -d
```

**Verify database is running:**
```bash
docker ps
```

You should see a container named `care-connect-backend-db-1` running.

### Step 2: Create Database Schema

Run the SQL schema to create all tables:

```bash
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -f schema.sql
```

**Expected output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
... (9 CREATE TABLE statements)
```

### Step 3: Verify Schema

Check that all tables were created:

```bash
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -c "\dt"
```

**Expected tables:**
- `applications`
- `bookings`
- `chats`
- `jobs`
- `messages`
- `nanny_details`
- `payments`
- `profiles`
- `reviews`
- `users`

---

## Seeding Test Data

### Run the Seed Script

Populate the database with test data:

```bash
npx prisma db seed
```

**Expected output:**
```
Running seed command `ts-node prisma/seed.ts` ...
{ parent: { id: '...', email: 'parent@example.com', ... } }
{ nanny: { id: '...', email: 'nanny@example.com', ... } }
{ nanny2: { id: '...', email: 'nanny2@example.com', ... } }
{ nanny3: { id: '...', email: 'nanny3@example.com', ... } }
{ job1: { id: '...', title: 'Weekend Babysitting', ... } }
{ job2: { id: '...', title: 'After School Care', ... } }
{ job3: { id: '...', title: 'Full Day Nanny Required', ... } }

🌱  The seed command has been executed.
```

### Verify Seed Data

Check that data was inserted:

```bash
# Count users
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -c "SELECT role, COUNT(*) FROM users GROUP BY role;"

# Expected output:
#  role   | count 
# --------+-------
#  parent |     1
#  nanny  |     3
```

---

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

**Expected output:**
```
Test Suites: 3 passed, 3 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        ~4s
```

### Run Specific Test Suites

**Location tests only:**
```bash
npm run test:e2e -- location.e2e-spec.ts
```

**User tests only:**
```bash
npm run test:e2e -- users.e2e-spec.ts
```

**App tests only:**
```bash
npm run test:e2e -- app.e2e-spec.ts
```

### Run Unit Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

---

## Test Data Overview

### Current Seed Data (Last Updated: 2025-11-20)

#### Users

| Email | Role | Name | Location | Details |
|-------|------|------|----------|---------|
| `parent@example.com` | parent | Rajesh Sharma | Bandra, Mumbai | Phone: +919876543210 |
| `nanny@example.com` | nanny | Priya Patel | Andheri, Mumbai | ₹300/hr, Skills: First Aid, Cooking, Hindi, English |
| `nanny2@example.com` | nanny | Sunita Desai | Powai, Mumbai | ₹250/hr, Skills: Music, Art, Swimming, Marathi, English |
| `nanny3@example.com` | nanny | Lakshmi Reddy | Koramangala, Bangalore | ₹350/hr, Skills: First Aid, Cooking, Kannada, English, Tamil |

#### Jobs

| Title | Location | Description | Date |
|-------|----------|-------------|------|
| Weekend Babysitting | Juhu, Mumbai | Need a babysitter for Saturday evening. Two kids aged 3 and 5. | 2025-12-01 |
| After School Care | Lower Parel, Mumbai | Looking for after school care for 2 kids. Pick up from school and help with homework. | 2025-12-05 |
| Full Day Nanny Required | Goregaon, Mumbai | Need a full-time nanny for infant care. Monday to Friday. | 2025-12-10 |

#### Location Coordinates

All seed data uses real Indian city coordinates:

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Bandra, Mumbai | 19.0596 | 72.8295 |
| Andheri, Mumbai | 19.1136 | 72.8697 |
| Powai, Mumbai | 19.1197 | 72.9059 |
| Juhu, Mumbai | 19.0760 | 72.8263 |
| Lower Parel, Mumbai | 19.0330 | 72.8326 |
| Goregaon, Mumbai | 19.1075 | 72.8479 |
| Koramangala, Bangalore | 12.9352 | 77.6245 |

---

## Test Coverage

### Current Test Suites

#### 1. App Tests (`app.e2e-spec.ts`)
- ✅ GET / (root endpoint)
- **Total: 1 test**

#### 2. User Tests (`users.e2e-spec.ts`)
- ✅ GET /users/:id - Return parent profile
- ✅ GET /users/:id - Return nanny profile with details
- ✅ GET /users/:id - Return 404 for non-existent user
- ✅ PUT /users/:id - Update parent profile
- ✅ PUT /users/:id - Update nanny details
- ✅ PUT /users/:id - Fail with invalid data
- **Total: 6 tests**

#### 3. Location Tests (`location.e2e-spec.ts`)
- ✅ GET /location/nannies/nearby - Find nearby nannies (default radius)
- ✅ GET /location/nannies/nearby - Find nearby nannies (custom radius)
- ✅ GET /location/nannies/nearby - Return empty array when no nannies nearby
- ✅ GET /location/nannies/nearby - Fail with invalid latitude
- ✅ GET /location/nannies/nearby - Fail with invalid longitude
- ✅ GET /location/nannies/nearby - Fail with missing parameters
- ✅ GET /location/nannies/nearby - Fail with invalid radius
- ✅ GET /location/jobs/nearby - Find nearby jobs (default radius)
- ✅ GET /location/jobs/nearby - Find nearby jobs (custom radius)
- ✅ GET /location/jobs/nearby - Return empty array when no jobs nearby
- ✅ GET /location/jobs/nearby - Fail with invalid parameters
- ✅ POST /location/geocode - Geocode a valid address
- ✅ POST /location/geocode - Fail with empty address
- ✅ POST /location/geocode - Fail with missing address
- **Total: 14 tests**

**Grand Total: 21 tests**

---

## Resetting the Database

If you need to start fresh:

### Option 1: Quick Reset (Recommended)

```bash
# Stop and remove containers
docker-compose down

# Start fresh
docker-compose up -d

# Recreate schema
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -f schema.sql

# Seed data
npx prisma db seed
```

### Option 2: Using Prisma Migrate Reset

```bash
# This will drop all tables, run migrations, and seed
npx prisma migrate reset --force
```

**Note:** If migrations folder is empty, use Option 1 instead.

---

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server at localhost:5433`

**Solution:**
```bash
# Check if Docker is running
docker ps

# If not running, start the database
docker-compose up -d

# Wait a few seconds for the database to be ready
sleep 5
```

### Seed Data Already Exists

**Error:** `Unique constraint failed`

**Solution:** The seed script uses `upsert`, so it should update existing records. If you still get errors:
```bash
# Clear all data and reseed
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -c "TRUNCATE users, profiles, nanny_details, jobs CASCADE;"
npx prisma db seed
```

### Tests Failing After Data Changes

**Problem:** Tests expect specific data that was modified

**Solution:**
1. Reset the database (see above)
2. Update test expectations to match new seed data
3. Update this guide with new test data

### Port Already in Use

**Error:** `port 5433 is already allocated`

**Solution:**
```bash
# Find and stop the process using port 5433
lsof -ti:5433 | xargs kill -9

# Or change the port in docker-compose.yml and .env
```

### Geocoding Tests Failing

**Error:** `Request failed with status code 403`

**Expected:** This is normal if `GOOGLE_MAPS_API_KEY` is not set in `.env`

The geocoding test will still pass but return `success: false`. To fix:
1. Get a Google Maps API key (see `Markdown/google-maps-api-setup.md`)
2. Add to `.env`: `GOOGLE_MAPS_API_KEY=your_key_here`

---

## Updating This Guide

### When to Update

This guide should be updated whenever:
- ✅ New seed data is added or modified
- ✅ New tests are created
- ✅ Database schema changes
- ✅ Test expectations change
- ✅ New test suites are added

### What to Update

1. **Test Data Overview** - Update user/job tables with new data
2. **Test Coverage** - Add new test descriptions
3. **Expected Output** - Update command outputs if they change
4. **Troubleshooting** - Add new common issues and solutions

### How to Update

1. Edit this file: `/Markdown/TESTING.md`
2. Update the "Last Updated" date in the Test Data Overview section
3. Commit changes with descriptive message:
   ```bash
   git add Markdown/TESTING.md
   git commit -m "docs: update testing guide with [description of changes]"
   ```

---

## Quick Reference

### Common Commands

```bash
# Start database
docker-compose up -d

# Create schema
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -f schema.sql

# Seed data
npx prisma db seed

# Run all tests
npm run test:e2e

# Run specific test
npm run test:e2e -- location.e2e-spec.ts

# Reset everything
docker-compose down && docker-compose up -d && sleep 5 && \
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -f schema.sql && \
npx prisma db seed
```

### Test Data Credentials

```
Parent: parent@example.com (password: dummy_hash)
Nanny 1: nanny@example.com (password: dummy_hash)
Nanny 2: nanny2@example.com (password: dummy_hash)
Nanny 3: nanny3@example.com (password: dummy_hash)
```

**Note:** These are test accounts with dummy password hashes. Do not use in production.

---

## Contributing

When adding new features:

1. ✅ Add seed data for your feature in `prisma/seed.ts`
2. ✅ Create E2E tests in `test/[feature].e2e-spec.ts`
3. ✅ Update this guide with new test data and test descriptions
4. ✅ Ensure all tests pass before committing
5. ✅ Document any new environment variables needed

---

**Last Updated:** 2025-11-20  
**Maintained By:** Development Team  
**Questions?** Check the main README.md or create an issue on GitHub
