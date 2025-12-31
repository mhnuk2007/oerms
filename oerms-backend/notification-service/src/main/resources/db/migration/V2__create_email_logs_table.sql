-- db/migration/V2__create_email_logs_table.sql
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY,
    to_email VARCHAR(255) NOT NULL,
    cc_emails VARCHAR(500),
    bcc_emails VARCHAR(500),
    subject VARCHAR(500) NOT NULL,
    body TEXT,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP,
    related_notification_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);