#!/bin/bash

# Development Environment Setup Script

set -e

echo "🛠️ Setting up Web3 Task Manager development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️ Please edit .env file with your configuration before running the application"
fi

# Create necessary directories
mkdir -p backend/logs
mkdir -p frontend/dist

# Build and start development services
echo "🔨 Building and starting development services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend npx prisma migrate dev --name init

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose exec backend npx prisma generate

echo "✅ Development environment setup completed!"
echo ""
echo "🌐 Services are running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo "   Database: localhost:5432"
echo "   Redis:    localhost:6379"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
