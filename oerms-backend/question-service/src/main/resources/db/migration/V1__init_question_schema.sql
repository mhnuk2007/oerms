CREATE SCHEMA IF NOT EXISTS oerms_question;

CREATE TABLE IF NOT EXISTS oerms_question.questions (
    id UUID PRIMARY KEY,
    exam_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    marks INTEGER NOT NULL,
    order_index INTEGER,
    correct_answer TEXT,
    explanation TEXT,
    difficulty_level VARCHAR(20),
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS oerms_question.question_options (
    question_id UUID NOT NULL,
    option_text VARCHAR(1000) NOT NULL,
    option_order INTEGER NOT NULL,
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES oerms_question.questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_questions_exam_id ON oerms_question.questions(exam_id);
CREATE INDEX idx_questions_type ON oerms_question.questions(type);
CREATE INDEX idx_questions_difficulty ON oerms_question.questions(difficulty_level);
CREATE INDEX idx_questions_order ON oerms_question.questions(exam_id, order_index);
