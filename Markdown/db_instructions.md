# Database Instructions

This document provides steps to manage, access, and modify the PostgreSQL database for the Care Connect project.

## Prerequisites
- Docker installed
- Docker Compose installed

## Getting Started

### 1. Start the Database
Run the following command in the root directory to start the PostgreSQL container:
```bash
docker-compose up -d
```

### 2. Check Container Status
Ensure the database service (`db`) is running and healthy:
```bash
docker-compose ps
```

### 3. Stop the Database
To stop and remove the containers:
```bash
docker-compose down
```

## Accessing the Database
You can interact with the database using the command line or a GUI tool (like DBeaver, TablePlus).

### Command Line Access
To enter the PostgreSQL shell inside the running container:
```bash
docker-compose exec db psql -U project_user -d careconnect
```

**Useful psql commands:**
- `\dt` : List all tables
- `\d table_name` : Show schema of a specific table
- `SELECT * FROM table_name;` : Query data
- `\q` : Exit the shell

### GUI / External Access
- **Host**: `localhost`
- **Port**: `5433`
- **Database**: `careconnect`
- **User**: `project_user`
- **Password**: `davanj123` (defined in `db.env`)

## Making Schema Changes

### Initial Schema
The core database structure is defined in the `schema.sql` file in the root directory.

### Applying Changes
If you have modified `schema.sql` or want to re-apply the schema (Note: this may error if tables already exist, or you might need to drop them first):

```bash
cat schema.sql | docker-compose exec -T db psql -U project_user -d careconnect
```

For incremental changes, it is recommended to create new migration files (e.g., `alter_users_table.sql`) and run them similarly:
```bash
cat your_migration_file.sql | docker-compose exec -T db psql -U project_user -d careconnect
```
