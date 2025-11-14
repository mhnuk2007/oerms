-- V1__Initial_Schema.sql

-- Create user_profiles table
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY,  -- Same as auth-server user.id
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
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
    enabled BOOLEAN,
    synced_at TIMESTAMP NOT NULL
);

-- Create user_profile_roles table
CREATE TABLE user_profile_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);
