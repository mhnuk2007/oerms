package com.oerms.common.constant;

/**
 * Centralized error codes
 */
public final class ErrorCodes {
    private ErrorCodes() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    // General
    public static final String INTERNAL_SERVER_ERROR = "ERR_INTERNAL_SERVER";
    public static final String BAD_REQUEST = "ERR_BAD_REQUEST";
    public static final String VALIDATION_ERROR = "ERR_VALIDATION";

    // Authentication & Authorization
    public static final String UNAUTHORIZED = "ERR_UNAUTHORIZED";
    public static final String FORBIDDEN = "ERR_FORBIDDEN";
    public static final String INVALID_TOKEN = "ERR_INVALID_TOKEN";
    public static final String TOKEN_EXPIRED = "ERR_TOKEN_EXPIRED";
    public static final String INVALID_CREDENTIALS = "ERR_INVALID_CREDENTIALS";

    // Resource
    public static final String RESOURCE_NOT_FOUND = "ERR_RESOURCE_NOT_FOUND";
    public static final String DUPLICATE_RESOURCE = "ERR_DUPLICATE_RESOURCE";

    // User
    public static final String USER_NOT_FOUND = "ERR_USER_NOT_FOUND";
    public static final String USER_ALREADY_EXISTS = "ERR_USER_EXISTS";
    public static final String USER_DISABLED = "ERR_USER_DISABLED";
    public static final String USER_LOCKED = "ERR_USER_LOCKED";

    // Exam
    public static final String EXAM_NOT_FOUND = "ERR_EXAM_NOT_FOUND";
    public static final String EXAM_NOT_ACTIVE = "ERR_EXAM_NOT_ACTIVE";
    public static final String EXAM_ALREADY_STARTED = "ERR_EXAM_STARTED";
    public static final String EXAM_ENDED = "ERR_EXAM_ENDED";

    // Question
    public static final String QUESTION_NOT_FOUND = "ERR_QUESTION_NOT_FOUND";
    public static final String INVALID_QUESTION_TYPE = "ERR_INVALID_QUESTION_TYPE";

    // Attempt
    public static final String ATTEMPT_NOT_FOUND = "ERR_ATTEMPT_NOT_FOUND";
    public static final String ATTEMPT_ALREADY_SUBMITTED = "ERR_ATTEMPT_SUBMITTED";
    public static final String ATTEMPT_NOT_ALLOWED = "ERR_ATTEMPT_NOT_ALLOWED";

    // Result
    public static final String RESULT_NOT_FOUND = "ERR_RESULT_NOT_FOUND";
    public static final String RESULT_NOT_PUBLISHED = "ERR_RESULT_NOT_PUBLISHED";

    // File
    public static final String FILE_UPLOAD_ERROR = "ERR_FILE_UPLOAD";
    public static final String FILE_SIZE_EXCEEDED = "ERR_FILE_SIZE";
    public static final String INVALID_FILE_TYPE = "ERR_FILE_TYPE";
}