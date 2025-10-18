-- Create schemas for all services
CREATE SCHEMA IF NOT EXISTS oerms_user;
CREATE SCHEMA IF NOT EXISTS oerms_exam;
CREATE SCHEMA IF NOT EXISTS oerms_question;
CREATE SCHEMA IF NOT EXISTS oerms_attempt;
CREATE SCHEMA IF NOT EXISTS oerms_result;
CREATE SCHEMA IF NOT EXISTS oerms_notification;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA oerms_user TO oerms_user;
GRANT ALL PRIVILEGES ON SCHEMA oerms_exam TO oerms_user;
GRANT ALL PRIVILEGES ON SCHEMA oerms_question TO oerms_user;
GRANT ALL PRIVILEGES ON SCHEMA oerms_attempt TO oerms_user;
GRANT ALL PRIVILEGES ON SCHEMA oerms_result TO oerms_user;
GRANT ALL PRIVILEGES ON SCHEMA oerms_notification TO oerms_user;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$ language 'plpgsql';

-- Log completion
DO $
BEGIN
    RAISE NOTICE 'Database schemas created successfully';
END $;
