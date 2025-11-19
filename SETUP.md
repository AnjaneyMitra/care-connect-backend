# CareConnect Backend - Setup Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js (v18+) installed
- Git

## Initial Setup (First Time)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd care-connect-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
# Database (already configured in docker-compose.yml)
DATABASE_URL=postgresql://project_user:davanj123@localhost:5433/careconnect

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=7d

# Google OAuth (when implementing)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### 4. Start the Database
```bash
docker-compose up -d
```

Check if the database is running and healthy:
```bash
docker-compose ps
```

You should see the `db` service with status "Up" and healthy.

### 5. Initialize the Database Schema
Apply the complete schema (includes all tables and OAuth support):
```bash
cat schema.sql | docker-compose exec -T db psql -U project_user -d careconnect
```

### 6. Verify Database Setup
```bash
docker-compose exec db psql -U project_user -d careconnect
```

Inside psql, run:
```sql
\dt  -- Should show all tables (users, profiles, jobs, etc.)
\d users  -- Should show users table with oauth_provider and oauth_provider_id
\q  -- Exit
```

### 7. Start the Backend
```bash
npm run start:dev
```

The backend should now be running on `http://localhost:3000`

---

## Updating an Existing Database

If you already have the database running and need to apply new changes:

### Check for New Migrations
```bash
ls migrations/
```

### Apply Migrations in Order
```bash
# Apply each migration file in numerical order
cat migrations/001_add_oauth_support.sql | docker-compose exec -T db psql -U project_user -d careconnect
cat migrations/002_remove_oauth_tokens.sql | docker-compose exec -T db psql -U project_user -d careconnect
```

---

## Common Commands

### Database Management
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop and remove all data (⚠️ destructive!)
docker-compose down -v

# View database logs
docker-compose logs db

# Access PostgreSQL shell
docker-compose exec db psql -U project_user -d careconnect
```

### Development
```bash
# Start development server
npm run start:dev

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm run start:prod
```

### Database Access (GUI Tools)
You can also connect using GUI tools like DBeaver, TablePlus, or pgAdmin:
- **Host**: `localhost`
- **Port**: `5433`
- **Database**: `careconnect`
- **User**: `project_user`
- **Password**: `davanj123`

---

## Troubleshooting

### Port 5433 already in use
```bash
# Find what's using the port
lsof -i :5433

# Stop the conflicting container
docker stop <container_name>

# Or change the port in docker-compose.yml
```

### Database not starting
```bash
# Check logs
docker-compose logs db

# Restart container
docker-compose restart db
```

### Schema changes not applying
```bash
# Ensure database is running
docker-compose ps

# Check for SQL errors in the schema file
cat schema.sql | docker-compose exec -T db psql -U project_user -d careconnect
```

### Reset Database (⚠️ Deletes all data!)
```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for database to be healthy
sleep 5

# Reapply schema
cat schema.sql | docker-compose exec -T db psql -U project_user -d careconnect
```

---

## Project Structure
```
care-connect-backend/
├── src/                    # Source code
├── migrations/             # Database migration files
├── schema.sql             # Complete database schema
├── docker-compose.yml     # Docker configuration
├── db.env                 # Database credentials
├── .env                   # Application environment variables
├── package.json           # Dependencies
└── README.md              # Project documentation
```

---

## Next Steps
- Read the [OAuth Implementation Guide](./Markdown/OAUTH_IMPLEMENTATION_GUIDE.md) to add Google authentication
- Read the [Database Instructions](./Markdown/db_instructions.md) for database management
- Check [features.md](./features.md) for planned features

---

## Need Help?
- Check existing issues in the repository
- Ask in the team chat
- Review the database instructions: `Markdown/db_instructions.md`
