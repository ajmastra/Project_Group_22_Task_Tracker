# TaskHub Backend API

Backend API for TaskHub task management application built with Node.js, Express.js, and PostgreSQL (via Supabase).

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env` file with:
```
SUPABASE_HOST=your-supabase-host
SUPABASE_PORT=5432
SUPABASE_DATABASE=your-database-name
SUPABASE_USER=your-database-user
SUPABASE_PASSWORD=your-database-password
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

### 3. Setup Database
Run `db/schema.sql` in your Supabase SQL editor to create tables.

### 4. Seed Test Data (Optional)
```bash
npm run seed
```
Test credentials: `test@example.com` / `password123`

### 5. Start Server
```bash
npm run dev    # Development mode
npm start      # Production mode
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/profile` - Get user profile (protected)

### Tasks (All require authentication)
- `GET /api/tasks` - Get all tasks (filter: `?status=new&priority=high`)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update status only
- `DELETE /api/tasks/:id` - Delete task

**Note:** Priority accepts integers (1=low, 2=medium, 3=high) or strings ('low', 'medium', 'high').

## Testing

Use `test-requests.http` with REST Client (VS Code) or Postman:
1. Login to get a token
2. Replace `{{token}}` in test file with your token
3. Test endpoints

## Project Structure

```
├── server.js              # Entry point
├── db/
│   ├── config.js          # Database connection
│   ├── schema.sql         # Database schema
│   └── seed.js            # Seed script
├── routes/                # API routes
├── controllers/           # Business logic
├── middleware/            # Auth & error handling
└── utils/                 # Utilities
```

## Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Security

- Passwords hashed with bcryptjs
- JWT tokens expire after 24 hours
- Users can only access their own tasks
- Input validation on all endpoints
- Parameterized queries prevent SQL injection
