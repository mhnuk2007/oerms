package com.oerms.common.constant;

public final class Constants {

    private Constants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // API Response Messages
    public static final class Messages {
        public static final String SUCCESS = "Operation completed successfully";
        public static final String CREATED = "Resource created successfully";
        public static final String UPDATED = "Resource updated successfully";
        public static final String DELETED = "Resource deleted successfully";
        public static final String NOT_FOUND = "Resource not found";
        public static final String VALIDATION_ERROR = "Validation failed";
        public static final String INTERNAL_ERROR = "Internal server error occurred";
        public static final String UNAUTHORIZED = "Unauthorized access";
        public static final String FORBIDDEN = "Access forbidden";
        public static final String BAD_REQUEST = "Bad request";
        public static final String CONFLICT = "Resource conflict occurred";
        
        private Messages() {}
    }

    // HTTP Headers
    public static final class Headers {
        public static final String AUTHORIZATION = "Authorization";
        public static final String BEARER_PREFIX = "Bearer ";
        public static final String USER_ID = "X-User-Id";
        public static final String USER_ROLES = "X-User-Roles";
        public static final String REQUEST_ID = "X-Request-Id";
        public static final String CORRELATION_ID = "X-Correlation-Id";
        
        private Headers() {}
    }

    // Security Constants
    public static final class Security {
        public static final String TOKEN_TYPE = "JWT";
        public static final String TOKEN_PREFIX = "Bearer ";
        public static final String AUTHORITIES_KEY = "authorities";
        public static final String ROLE_PREFIX = "ROLE_";
        public static final long ACCESS_TOKEN_VALIDITY = 3600000L; // 1 hour
        public static final long REFRESH_TOKEN_VALIDITY = 86400000L; // 24 hours
        
        private Security() {}
    }

    // Roles
    public static final class Roles {
        public static final String ADMIN = "ADMIN";
        public static final String TEACHER = "TEACHER";
        public static final String STUDENT = "STUDENT";
        
        public static final String ROLE_ADMIN = "ROLE_ADMIN";
        public static final String ROLE_TEACHER = "ROLE_TEACHER";
        public static final String ROLE_STUDENT = "ROLE_STUDENT";
        
        private Roles() {}
    }

    // Permissions
    public static final class Permissions {
        // User permissions
        public static final String USER_READ = "user:read";
        public static final String USER_WRITE = "user:write";
        public static final String USER_DELETE = "user:delete";
        
        // Exam permissions
        public static final String EXAM_READ = "exam:read";
        public static final String EXAM_WRITE = "exam:write";
        public static final String EXAM_DELETE = "exam:delete";
        public static final String EXAM_PUBLISH = "exam:publish";
        
        // Question permissions
        public static final String QUESTION_READ = "question:read";
        public static final String QUESTION_WRITE = "question:write";
        public static final String QUESTION_DELETE = "question:delete";
        
        // Attempt permissions
        public static final String ATTEMPT_READ = "attempt:read";
        public static final String ATTEMPT_WRITE = "attempt:write";
        
        // Result permissions
        public static final String RESULT_READ = "result:read";
        public static final String RESULT_WRITE = "result:write";
        public static final String RESULT_PUBLISH = "result:publish";
        
        private Permissions() {}
    }

    // Kafka Topics
    public static final class KafkaTopics {
        public static final String USER_CREATED = "user.created";
        public static final String USER_UPDATED = "user.updated";
        public static final String USER_DELETED = "user.deleted";
        
        public static final String EXAM_CREATED = "exam.created";
        public static final String EXAM_PUBLISHED = "exam.published";
        public static final String EXAM_UPDATED = "exam.updated";
        public static final String EXAM_DELETED = "exam.deleted";
        
        public static final String ATTEMPT_STARTED = "attempt.started";
        public static final String ATTEMPT_SUBMITTED = "attempt.submitted";
        
        public static final String RESULT_PUBLISHED = "result.published";
        public static final String RESULT_UPDATED = "result.updated";
        
        public static final String NOTIFICATION_EMAIL = "notification.email";
        public static final String NOTIFICATION_SMS = "notification.sms";
        public static final String NOTIFICATION_PUSH = "notification.push";
        
        public static final String PASSWORD_RESET = "password.reset";
        public static final String EXAM_REMINDER = "exam.reminder";
        
        private KafkaTopics() {}
    }

    // Redis Keys
    public static final class RedisKeys {
        public static final String TOKEN_BLACKLIST = "token:blacklist:";
        public static final String USER_PROFILE = "user:profile:";
        public static final String EXAM_LIST = "exam:list:";
        public static final String EXAM_DETAIL = "exam:detail:";
        public static final String QUESTION_CACHE = "question:cache:";
        public static final String RATE_LIMIT = "rate:limit:";
        public static final String SESSION = "session:";
        
        private RedisKeys() {}
    }

    // Cache TTL (in seconds)
    public static final class CacheTTL {
        public static final long USER_PROFILE = 1800L; // 30 minutes
        public static final long EXAM_LIST = 600L; // 10 minutes
        public static final long EXAM_DETAIL = 900L; // 15 minutes
        public static final long QUESTION = 1800L; // 30 minutes
        public static final long TOKEN_BLACKLIST = 3600L; // 1 hour
        
        private CacheTTL() {}
    }

    // Pagination
    public static final class Pagination {
        public static final int DEFAULT_PAGE = 0;
        public static final int DEFAULT_SIZE = 20;
        public static final int MAX_SIZE = 100;
        public static final String DEFAULT_SORT = "createdAt";
        public static final String DEFAULT_DIRECTION = "DESC";
        
        private Pagination() {}
    }

    // Date/Time Formats
    public static final class DateTimeFormat {
        public static final String DATE_FORMAT = "yyyy-MM-dd";
        public static final String TIME_FORMAT = "HH:mm:ss";
        public static final String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
        public static final String ISO_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
        
        private DateTimeFormat() {}
    }

    // Exam Constants
    public static final class Exam {
        public static final int MIN_DURATION = 15; // minutes
        public static final int MAX_DURATION = 300; // minutes
        public static final int DEFAULT_DURATION = 60; // minutes
        
        public static final int MIN_QUESTIONS = 1;
        public static final int MAX_QUESTIONS = 200;
        
        public static final double MIN_NEGATIVE_MARKS = 0.0;
        public static final double MAX_NEGATIVE_MARKS = 1.0;
        
        private Exam() {}
    }

    // Question Types
    public static final class QuestionType {
        public static final String MCQ = "MCQ";
        public static final String TRUE_FALSE = "TRUE_FALSE";
        public static final String SHORT_ANSWER = "SHORT_ANSWER";
        public static final String ESSAY = "ESSAY";
        
        private QuestionType() {}
    }

    // Exam Status
    public static final class ExamStatus {
        public static final String DRAFT = "DRAFT";
        public static final String PUBLISHED = "PUBLISHED";
        public static final String SCHEDULED = "SCHEDULED";
        public static final String ACTIVE = "ACTIVE";
        public static final String COMPLETED = "COMPLETED";
        public static final String CANCELLED = "CANCELLED";
        
        private ExamStatus() {}
    }

    // Attempt Status
    public static final class AttemptStatus {
        public static final String IN_PROGRESS = "IN_PROGRESS";
        public static final String SUBMITTED = "SUBMITTED";
        public static final String AUTO_SUBMITTED = "AUTO_SUBMITTED";
        public static final String ABANDONED = "ABANDONED";
        
        private AttemptStatus() {}
    }

    // Result Status
    public static final class ResultStatus {
        public static final String PENDING = "PENDING";
        public static final String GRADING = "GRADING";
        public static final String PUBLISHED = "PUBLISHED";
        
        private ResultStatus() {}
    }

    // File Upload
    public static final class FileUpload {
        public static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"};
        public static final String[] ALLOWED_DOCUMENT_TYPES = {"application/pdf", "application/msword"};
        
        private FileUpload() {}
    }

    // Validation Messages
    public static final class ValidationMessages {
        public static final String REQUIRED = "This field is required";
        public static final String INVALID_EMAIL = "Invalid email format";
        public static final String INVALID_PASSWORD = "Password must be at least 8 characters";
        public static final String INVALID_USERNAME = "Username must be 3-50 characters";
        public static final String INVALID_PHONE = "Invalid phone number";
        public static final String FUTURE_DATE = "Date must be in the future";
        public static final String PAST_DATE = "Date must be in the past";
        public static final String INVALID_RANGE = "Value must be within valid range";
        
        private ValidationMessages() {}
    }
}