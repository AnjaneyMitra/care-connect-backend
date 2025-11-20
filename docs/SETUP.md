# Setup & Running Instructions

## Prerequisites

- **Node.js**: v18 or higher
- **Docker**: For running the PostgreSQL database
- **npm**: Package manager

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd care-connect-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your configuration (especially `GOOGLE_MAPS_API_KEY` if you want geocoding to work).

### 4. Database Setup

Start the PostgreSQL container:

```bash
docker-compose up -d
```

Create the database schema:

```bash
# Using the provided SQL script
PGPASSWORD=davanj123 psql -h localhost -p 5433 -U project_user -d careconnect -f schema.sql
```

Seed the database with test data:

```bash
npx prisma db seed
```

### 5. Start the Server

Development mode (with hot reload):

```bash
npm run start:dev
```

The API will be available at `http://localhost:4000`.

**Note**: The backend runs on port 4000 to avoid conflicts with Next.js frontend (port 3000).

## Running Tests

Run end-to-end tests to verify everything is working:

```bash
npm run test:e2e
```

## Troubleshooting

### Database Connection Issues
If you can't connect to the database, ensure the Docker container is running:
```bash
docker ps
```
You should see `care-connect-backend-db-1`.

### Port Conflicts
- **Backend Port**: Default is 4000. If in use, update `PORT` in `.env`.
- **Database Port**: Default is 5433. If in use, update `docker-compose.yml` and `.env`.
- **Frontend Port**: Next.js uses 3000 by default.
