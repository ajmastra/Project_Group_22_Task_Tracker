# TaskHub

Full-stack task management application built with PERN stack (PostgreSQL, Express, React, Node.js).

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:
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

### 5. Start Application

**Terminal 1 - Backend:**
```bash
npm run dev    # Development mode
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Frontend runs on `http://localhost:3000`

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
├── server.js              # Backend entry point
├── db/                     # Database files
│   ├── config.js
│   ├── schema.sql
│   └── seed.js
├── routes/                 # API routes
├── controllers/            # Business logic
├── middleware/             # Auth & error handling
├── utils/                  # Utilities
└── client/                 # React frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   └── router/          # Routing
    └── public/
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
