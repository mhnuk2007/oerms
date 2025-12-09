CREATE SCHEMA IF NOT EXISTS oerms_exam;

CREATE TABLE IF NOT EXISTS oerms_exam.exams (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    teacher_id BIGINT NOT NULL,
    teacher_name VARCHAR(255),
    duration INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    passing_marks INTEGER NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    allow_multiple_attempts BOOLEAN DEFAULT FALSE,
    max_attempts INTEGER DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    show_results_immediately BOOLEAN DEFAULT FALSE,
    instructions VARCHAR(5000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_exams_teacher_id ON oerms_exam.exams(teacher_id);
CREATE INDEX idx_exams_status ON oerms_exam.exams(status);
