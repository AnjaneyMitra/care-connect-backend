#!/bin/bash

# CareConnect Backend - Quick Setup Script
# This script sets up the database and applies the schema

set -e  # Exit on any error

echo "🚀 CareConnect Backend Setup"
echo "=============================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update it with your configuration."
    else
        echo "⚠️  Warning: .env.example not found. You'll need to create .env manually."
    fi
fi

# Start Docker containers
echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for database to be healthy (max 30 seconds)
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U project_user > /dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start within 30 seconds"
        echo "   Check logs with: docker-compose logs db"
        exit 1
    fi
    sleep 1
done

# Apply schema
echo ""
echo "📊 Applying database schema..."
if cat schema.sql | docker-compose exec -T db psql -U project_user -d careconnect > /dev/null 2>&1; then
    echo "✅ Schema applied successfully!"
else
    echo "❌ Failed to apply schema"
    echo "   This might mean the tables already exist."
    echo "   To reset the database, run: docker-compose down -v"
    exit 1
fi

# Verify setup
echo ""
echo "🔍 Verifying setup..."
TABLE_COUNT=$(docker-compose exec -T db psql -U project_user -d careconnect -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "✅ Found $TABLE_COUNT tables in database"
else
    echo "❌ No tables found in database"
    exit 1
fi

# Success message
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update your .env file with API keys and secrets"
echo "  2. Run: npm install"
echo "  3. Run: npm run start:dev"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5433"
echo "  Database: careconnect"
echo "  User: project_user"
echo "  Password: davanj123"
echo ""
echo "📚 For more information, see SETUP.md"
