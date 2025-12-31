package com.oerms.common.constant;

public class Constants {
    
    public static class Roles {
        public static final String ROLE_ADMIN = "ROLE_ADMIN";
        public static final String ROLE_TEACHER = "ROLE_TEACHER";
        public static final String ROLE_STUDENT = "ROLE_STUDENT";
    }
    
    public static class CacheNames {
        public static final String EXAMS = "exams";
        public static final String PUBLISHED_EXAMS = "publishedExams";
        public static final String TEACHER_EXAMS = "teacherExams";
        public static final String ATTEMPTS = "attempts";
        public static final String RESULTS = "results";
    }
    
    public static class EventTopics {
        public static final String EXAM_CREATED = "exam.created";
        public static final String EXAM_PUBLISHED = "exam.published";
        public static final String EXAM_CANCELLED = "exam.cancelled";
        public static final String ATTEMPT_STARTED = "attempt.started";
        public static final String ATTEMPT_SUBMITTED = "attempt.submitted";
        public static final String RESULT_PUBLISHED = "result.published";
    }
    
    public static class ValidationMessages {
        public static final String REQUIRED_FIELD = "This field is required";
        public static final String INVALID_EMAIL = "Invalid email format";
        public static final String INVALID_DATE = "Invalid date format";
        public static final String MIN_LENGTH = "Minimum length is {min}";
        public static final String MAX_LENGTH = "Maximum length is {max}";
    }
}
