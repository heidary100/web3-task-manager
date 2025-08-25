# 🚀 Web3 Authenticated Task Manager

A full-stack Web3 task management application with wallet authentication, async processing, and real-time updates.

## 🏗 Architecture

- **Frontend**: React + TypeScript + TailwindCSS + React Query
- **Backend**: NestJS + TypeScript + PostgreSQL + Prisma ORM
- **Web3**: Reown SDK for wallet-only authentication
- **Async Processing**: BullMQ + Redis for background jobs
- **Containerization**: Docker Compose for all services

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd web3-task-manager
```

### 2. Environment Setup

Create `.env` files in both `backend/` and `frontend/` directories (examples provided):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend `.env` (required):**
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/tasks
JWT_SECRET=change_me_in_dev_and_prod
REDIS_HOST=redis
REDIS_PORT=6379
PORT=4000
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:4000
VITE_REOWN_PROJECT_ID=your_reown_project_id_here
```

### 3. Start with Docker
```bash
docker compose up --build
```

**Services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Documentation (Swagger): http://localhost:4000/api-docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI and is available at the /api-docs endpoint:

1. Start the application using `docker compose up`
2. Open http://localhost:4000/api-docs in your browser
   - The root endpoint (http://localhost:4000) will automatically redirect you to the documentation
3. You'll see the interactive Swagger documentation with all available endpoints

### Authentication in Swagger

To test authenticated endpoints in Swagger UI:

1. Log in using the authentication endpoint to get a JWT token
2. Click the "Authorize" button at the top of the Swagger UI
3. Enter your JWT token in the format: `Bearer your_token_here`
4. All subsequent API calls will include your authentication token

### Available API Sections

- **Auth**: Authentication endpoints for wallet login
- **Tasks**: Complete task management endpoints
  - Create single/bulk tasks
  - List tasks with pagination
  - Update task status
  - Delete tasks
  - Administrative endpoints for stats and cleanup

### 4. Database Migration
```bash
docker compose exec backend npx prisma migrate deploy
```

If developing locally without Docker, use:

```bash
cd backend
npx prisma migrate dev
```

## 🔑 Authentication Flow

1. User clicks "Login with Wallet"
2. Backend generates a cryptographically secure nonce challenge
3. User signs the challenge with their wallet
4. Backend verifies signature and issues JWT token (JWT secret required via env)
5. JWT is used for all authenticated API requests

## 📝 Task Management Features

- **Create Task**: Immediately enqueues async processing job
- **View Tasks**: Paginated list with virtualization for 10k+ tasks
- **Update/Delete**: Full CRUD operations with proper authorization
- **Status Tracking**: Real-time status updates (PENDING → PROCESSED/FAILED)
- **Audit Logs**: Complete task history in `task_logs` table

## ⚡ Async Processing

- **Background Jobs**: BullMQ processes tasks after 5-second delay
- **Status Updates**: Automatic status changes from pending to processed
- **Error Handling**: Failed jobs are logged with error details
- **Scalability**: Redis-backed job queue handles high throughput

## 📊 Performance Optimizations

- **Frontend Virtualization**: `react-window` for smooth rendering of 10k+ tasks. We combine server-side pagination (default 50/page, capped) with list virtualization to minimize DOM nodes and memory while maintaining responsive scrolling.
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Server-side pagination reduces memory usage
- **Connection Pooling**: Efficient database connection management

### Database schema hardening
- `Task.status` is a PostgreSQL-backed enum (`TaskStatus`) with values: `PENDING`, `PROCESSED`, `FAILED`.
- Indexes: `@@index([userId, createdAt])`, `@@index([userId, status])` and `TaskLog @@index([taskId, createdAt])` for efficient filtering and ordering.

## 🧪 Testing

Run backend tests:
```bash
docker compose exec backend npm run test
```

Run test coverage:
```bash
docker compose exec backend npm run test:cov
```

## 🛡 Security Features

- **Input Validation**: `class-validator` for all API inputs
- **JWT Authentication**: Secure token-based authentication (JWT secret is mandatory; app fails fast if missing)
- **CORS Configuration**: Properly configured cross-origin requests
- **Error Handling**: Global exception filters prevent information leakage
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🔧 Development

### Local Development (without Docker)

1. **Start PostgreSQL and Redis locally**
2. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run start:dev
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 📁 Project Structure

```
web3-task-manager/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Web3 authentication
│   │   ├── tasks/          # Task management
│   │   ├── common/         # Shared utilities
│   │   └── main.ts
│   ├── prisma/             # Database schema & migrations
│   └── Dockerfile
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── pages/          # Page components
│   └── Dockerfile
├── scripts/                # Database scripts
├── docker-compose.yml      # Container orchestration
└── README.md
```

Note: The workspace uses separate `backend/` and `frontend/` apps.

## 🚀 Deployment

### Production Environment Variables

Update environment variables for production:

```env
# Backend
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_jwt_secret
REDIS_HOST=your_redis_host

# Frontend  
VITE_API_URL=https://your-api-domain.com
VITE_REOWN_PROJECT_ID=your_production_reown_id
```

### Docker Production Build

```bash
docker compose -f docker-compose.prod.yml up --build
```

## ✅ Assignment Compliance Checklist

- Web3 authentication via Reown SDK (wallet-only): Implemented (`frontend/src/contexts/WalletContext.tsx`, `AuthContext.tsx`).
- Secure verification via signed nonce: Implemented with crypto-secure nonce and signature verification (`backend/src/auth`).
- JWT session for protected routes: Implemented; required env `JWT_SECRET`, fail-fast check on boot.
- React + TypeScript + Tailwind CSS frontend: Implemented (Vite). Virtualized list and pagination for 10k+ tasks.
- NestJS + TypeScript + PostgreSQL + Prisma backend: Implemented with modular structure.
- Async backend job on task creation: Implemented using Bull + Redis; 5s delay, retries, logs, status transitions.
- Docker Compose for all services: Implemented (Postgres, Redis, Backend, Frontend).
- Database relations and audit logging: Implemented (`User`, `Task`, `TaskLog` + indexes, enum `TaskStatus`).
- API security, validation, error handling: Implemented with `class-validator`, guards, and proper exceptions.
- Testing: Backend test harness configured (Jest). Add tests as needed; see scripts in README.
- UI/UX: Clean, responsive Tailwind-based UI with modern components.

Optional bonus (Real-time collaboration): Not included in this version.

Assumptions & decisions:
- Chosen pagination + virtualization to handle very large lists efficiently while keeping API and client memory usage predictable.
- Bulk task creation queues a single bulk job with deterministic IDs using a DB transaction.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
