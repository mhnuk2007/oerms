CREATE TABLE user_profiles (
                               id UUID PRIMARY KEY,
                               user_id UUID UNIQUE NOT NULL,
                               firstname VARCHAR(100),
                               lastname VARCHAR(100),
                               city VARCHAR(100),
                               institution VARCHAR(200),
                               profile_picture VARCHAR(500),
                               profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at TIMESTAMP NOT NULL,
                               updated_at TIMESTAMP NOT NULL,
                               created_by VARCHAR(50),
                               last_modified_by VARCHAR(50),
                               version BIGINT
);