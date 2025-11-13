-- TaskHub Database Schema
-- goal is to initialize the two tables in the postgres db:
  -- 1. users table for authentication
  -- 2. tasks table for task management 

-- create users table for authentication with the following columns:
  -- user_id: serial primary key
  -- email: varchar(255) unique not null
  -- password_hash: varchar(255) nn
  -- first_name: varchar(255)
  -- last_name: varchar(255)
  -- created_at: timestamp default current timestamp
  -- updated_at: timestamp default current timestamp
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create tasks table for task management with the following columns:
  -- task_id: serial primary key
  -- title: varchar(255) not null
  -- description: text
  -- status: varchar(50) default 'pending'
  -- priority: integer default 2 (1=low, 2=medium, 3=high)
  -- due_date: timestamp
  -- created_by: integer not null references users(user_id) on delete cascade
  -- assigned_to: integer references users(user_id) on delete set null
CREATE TABLE IF NOT EXISTS tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'new',
    priority INTEGER DEFAULT 2, -- 1=low, 2=medium, 3=high
    due_date TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- creat indexes for better query performance
  -- idx_tasks_created_by: index on created_by column
  -- idx_tasks_assigned_to: index on assigned_to column
  -- idx_tasks_status: index on status column
  -- idx_tasks_priority: index on priority column
  -- idx_users_email: index on email column
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- create triggers to auto-update updated_at when editing a user or task
  -- user:
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  -- task:
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
