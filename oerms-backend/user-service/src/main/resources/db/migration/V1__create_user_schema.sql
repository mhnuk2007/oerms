/*
-- Create schema
CREATE SCHEMA IF NOT EXISTS oerms_user;

-- Users table
CREATE TABLE oerms_user.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User roles table
CREATE TABLE oerms_user.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES oerms_user.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, role)
);

-- Refresh tokens table
CREATE TABLE oerms_user.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES oerms_user.users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX idx_users_email ON oerms_user.users(email);
CREATE INDEX idx_users_active ON oerms_user.users(is_active) WHERE is_deleted = false;
CREATE INDEX idx_users_deleted ON oerms_user.users(is_deleted);
CREATE INDEX idx_user_roles_user_id ON oerms_user.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON oerms_user.user_roles(role);
CREATE INDEX idx_refresh_tokens_user_id ON oerms_user.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON oerms_user.refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON oerms_user.refresh_tokens(expires_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON oerms_user.users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- BCrypt hash for 'admin123'
INSERT INTO oerms_user.users (id, email, password_hash, name, is_active, is_deleted)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@oerms.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYVYdYfWzN2',
    'System Administrator',
    true,
    false
);

INSERT INTO oerms_user.user_roles (user_id, role)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ADMIN');

-- Insert sample teacher user (password: teacher123)
-- BCrypt hash for 'teacher123'
INSERT INTO oerms_user.users (id, email, password_hash, name, is_active)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'teacher@oerms.com',
    '$2a$12$8WY7Z3wGzM5K.UL9Nz2LKO8vYZ9kCx5y7Q8fJ3nH5gK2wX4yT6zZe',
    'John Teacher',
    true
);

INSERT INTO oerms_user.user_roles (user_id, role)
VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'TEACHER');

-- Insert sample student user (password: student123)
-- BCrypt hash for 'student123'
INSERT INTO oerms_user.users (id, email, password_hash, name, is_active)
VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'student@oerms.com',
    '$2a$12$9XZ8A4xHz6N6L.VM0O3MOu9wZA0lDy6z8R9gK4oI6hL3xY5zU7a1f',
    'Jane Student',
    true
);

INSERT INTO oerms_user.user_roles (user_id, role)
VALUES ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'STUDENT');

-- Add comments for documentation
COMMENT ON TABLE oerms_user.users IS 'Main users table storing user account information';
COMMENT ON TABLE oerms_user.user_roles IS 'User roles mapping table';
COMMENT ON TABLE oerms_user.refresh_tokens IS 'JWT refresh tokens for authentication';
COMMENT ON COLUMN oerms_user.users.password_hash IS 'BCrypt hashed password with strength 12';
COMMENT ON COLUMN oerms_user.users.is_deleted IS 'Soft delete flag to maintain data integrity';
*/
