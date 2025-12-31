-- db/migration/V3__create_notification_templates_table.sql
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    email_template TEXT NOT NULL,
    sms_template TEXT,
    in_app_template TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_templates_code ON notification_templates(code);
CREATE INDEX idx_templates_type ON notification_templates(type);