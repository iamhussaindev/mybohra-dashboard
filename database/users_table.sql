-- Create Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  name TEXT NOT NULL,
  roles TEXT[] DEFAULT ARRAY['user'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Allow authenticated users to read all users
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert users
CREATE POLICY "Users can insert users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update users
CREATE POLICY "Users can update users" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete users
CREATE POLICY "Users can delete users" ON users
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Insert some sample data (optional)
INSERT INTO users (email, phone_number, name, roles) VALUES
  ('admin@example.com', '+1234567890', 'Admin User', ARRAY['admin', 'user']),
  ('user1@example.com', '+1234567891', 'John Doe', ARRAY['user']),
  ('user2@example.com', '+1234567892', 'Jane Smith', ARRAY['user']),
  ('manager@example.com', '+1234567893', 'Manager User', ARRAY['manager', 'user']);
