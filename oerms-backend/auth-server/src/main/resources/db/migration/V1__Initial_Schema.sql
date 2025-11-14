-- V1__Initial_Schema.sql

-- Create users table with all profile fields
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    profile_image_url VARCHAR(500),
    date_of_birth TIMESTAMP,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

-- Insert initial admin user
INSERT INTO users (username, email, password, first_name, last_name, enabled)
VALUES ('admin', 'admin@oerms.com',
        '$2a$10$tW2a7bGbIanh4JQdN0l3uO3mnqjemt45YsxXk5l09Q9ZxtkDe4CTK', -- password: "password"
        'System', 'Admin', TRUE);

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_ADMIN' FROM users WHERE username = 'admin';

-- Insert initial teacher user
INSERT INTO users (username, email, password, first_name, last_name, enabled)
VALUES ('teacher', 'teacher@oerms.com',
        '$2a$10$4WYJMD68epVfgb6DYNWbQ.qKtq3HA.lSKa2XUq6uaqQvu5i5uTpyq', -- password: "password"
        'Default', 'Teacher', TRUE);

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_TEACHER' FROM users WHERE username = 'teacher';

-- Insert initial student user
INSERT INTO users (username, email, password, first_name, last_name, enabled)
VALUES ('student', 'student@oerms.com',
        '$2a$10$ePoWzmFSEzOBC1QCDx4hmO9./w0151dxU1/9xzENGC6piyGK3IouG', -- password: "password"
        'Default', 'Student', TRUE);

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_STUDENT' FROM users WHERE username = 'student';
