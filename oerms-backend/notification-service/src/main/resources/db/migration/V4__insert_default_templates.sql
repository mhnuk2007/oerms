INSERT INTO notification_templates (id, code, type, subject, email_template, is_active, created_at, updated_at, created_by, last_modified_by, version)
VALUES
(gen_random_uuid(), 'USER_REGISTERED', 'USER_REGISTERED',
 'Welcome to OERMS!',
 '<h1>Welcome to OERMS!</h1><p>Your account has been successfully created.</p>',
 true, NOW(), NOW(), 'SYSTEM', 'SYSTEM', 0),

(gen_random_uuid(), 'EXAM_PUBLISHED', 'EXAM_PUBLISHED',
 'Exam Published',
 '<h1>Exam Published</h1><p>Your exam is now live and available for students.</p>',
 true, NOW(), NOW(), 'SYSTEM', 'SYSTEM', 0),

(gen_random_uuid(), 'RESULT_PUBLISHED', 'RESULT_PUBLISHED',
 'Exam Results Available',
 '<h1>Your Results Are Ready!</h1><p>Your exam results have been published.</p>',
 true, NOW(), NOW(), 'SYSTEM', 'SYSTEM', 0);