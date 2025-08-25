#!/bin/bash

# Web3 Task Manager Deployment Script

set -e

echo "🚀 Starting Web3 Task Manager deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "VITE_REOWN_PROJECT_ID")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate

# Seed database (optional)
if [ "$1" = "--seed" ]; then
    echo "🌱 Seeding database..."
    docker-compose -f docker-compose.prod.yml exec backend npm run seed
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Services are running at:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "   Backend:  http://localhost:${BACKEND_PORT:-4000}"
echo "   Database: localhost:${DB_PORT:-5432}"
echo "   Redis:    localhost:${REDIS_PORT:-6379}"
echo ""
echo "📊 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
