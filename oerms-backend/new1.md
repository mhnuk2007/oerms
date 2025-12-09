import React, { useState } from 'react';
import { FileText, Folder, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

const FileTree = () => {
const [expandedFolders, setExpandedFolders] = useState({
'oerms-parent': true,
'common': true,
'common/src': true,
'common/src/main': true,
'common/src/main/java': true,
'common/src/main/java/com': true,
'common/src/main/java/com/oerms': true,
'common/src/main/java/com/oerms/common': true,
'entity': true,
'dto': true,
'exception': true,
'constant': true,
'util': true
});

const [selectedFile, setSelectedFile] = useState('pom.xml');
const [copied, setCopied] = useState(false);

const fileContents = {
'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
http://maven.apache.org/xsd/maven-4.0.0.xsd">
<modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.oerms</groupId>
    <artifactId>oerms-parent</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <name>OERMS Parent</name>
    <description>Online Exam and Result Management System - Parent Module</description>

    <modules>
        <module>common</module>
        <module>system-registry</module>
        <module>auth-server</module>
        <module>api-gateway</module>
        <module>user-service</module>
        <module>exam-service</module>
        <module>question-service</module>
        <module>attempt-service</module>
        <module>result-service</module>
        <module>notification-service</module>
    </modules>

    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.1</spring-cloud.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        
        <!-- Dependency Versions -->
        <lombok.version>1.18.30</lombok.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <jakarta.validation.version>3.0.2</jakarta.validation.version>
        <commons-lang3.version>3.14.0</commons-lang3.version>
        <jackson.version>2.15.3</jackson.version>
        <springdoc.version>2.3.0</springdoc.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Cloud Dependencies -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>\${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Common Module -->
            <dependency>
                <groupId>com.oerms</groupId>
                <artifactId>common</artifactId>
                <version>\${project.version}</version>
            </dependency>

            <!-- Lombok -->
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>\${lombok.version}</version>
                <scope>provided</scope>
            </dependency>

            <!-- MapStruct -->
            <dependency>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct</artifactId>
                <version>\${mapstruct.version}</version>
            </dependency>

            <!-- Validation -->
            <dependency>
                <groupId>jakarta.validation</groupId>
                <artifactId>jakarta.validation-api</artifactId>
                <version>\${jakarta.validation.version}</version>
            </dependency>

            <!-- Apache Commons -->
            <dependency>
                <groupId>org.apache.commons</groupId>
                <artifactId>commons-lang3</artifactId>
                <version>\${commons-lang3.version}</version>
            </dependency>

            <!-- Jackson -->
            <dependency>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-databind</artifactId>
                <version>\${jackson.version}</version>
            </dependency>

            <!-- SpringDoc OpenAPI -->
            <dependency>
                <groupId>org.springdoc</groupId>
                <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
                <version>\${springdoc.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <configuration>
                        <excludes>
                            <exclude>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok</artifactId>
                            </exclude>
                        </excludes>
                    </configuration>
                </plugin>
                
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.11.0</version>
                    <configuration>
                        <source>\${java.version}</source>
                        <target>\${java.version}</target>
                        <annotationProcessorPaths>
                            <path>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok</artifactId>
                                <version>\${lombok.version}</version>
                            </path>
                            <path>
                                <groupId>org.mapstruct</groupId>
                                <artifactId>mapstruct-processor</artifactId>
                                <version>\${mapstruct.version}</version>
                            </path>
                        </annotationProcessorPaths>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

</project>`,
    'common/pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
http://maven.apache.org/xsd/maven-4.0.0.xsd">
<modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.oerms</groupId>
        <artifactId>oerms-parent</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>common</artifactId>
    <packaging>jar</packaging>

    <name>OERMS Common</name>
    <description>Shared utilities, DTOs, entities, and exceptions</description>

    <dependencies>
        <!-- Spring Data JPA (for base entities only) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
            <scope>provided</scope>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Jackson for JSON -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>

        <dependency>
            <groupId>com.fasterxml.jackson.datatype</groupId>
            <artifactId>jackson-datatype-jsr310</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>
        </dependency>

        <!-- Apache Commons -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
        </dependency>

        <!-- Servlet API -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Do NOT use spring-boot-maven-plugin for common module -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>`,
    'BaseEntity.java': `package com.oerms.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
* Base entity class with common audit fields.
* All domain entities should extend this class.
*
* @MappedSuperclass ensures this is not created as a separate table
  */
  @MappedSuperclass
  @EntityListeners(AuditingEntityListener.class)
  @Getter
  @Setter
  public abstract class BaseEntity implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Version
  @Column(name = "version")
  private Long version;

  @Override
  public boolean equals(Object o) {
  if (this == o) return true;
  if (!(o instanceof BaseEntity)) return false;
  BaseEntity that = (BaseEntity) o;
  return id != null && id.equals(that.getId());
  }

  @Override
  public int hashCode() {
  return getClass().hashCode();
  }
  }`,
    'ApiResponse.java': `package com.oerms.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
* Standard API Response wrapper for all REST endpoints
  */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public class ApiResponse<T> {

  private boolean success;
  private String message;
  private T data;
  private ErrorDetails error;

  @Builder.Default
  private LocalDateTime timestamp = LocalDateTime.now();

  // Success responses
  public static <T> ApiResponse<T> success(T data) {
  return ApiResponse.<T>builder()
  .success(true)
  .data(data)
  .build();
  }

  public static <T> ApiResponse<T> success(String message, T data) {
  return ApiResponse.<T>builder()
  .success(true)
  .message(message)
  .data(data)
  .build();
  }

  public static <T> ApiResponse<T> success(String message) {
  return ApiResponse.<T>builder()
  .success(true)
  .message(message)
  .build();
  }

  // Error responses
  public static <T> ApiResponse<T> error(String message) {
  return ApiResponse.<T>builder()
  .success(false)
  .message(message)
  .build();
  }

  public static <T> ApiResponse<T> error(String message, ErrorDetails error) {
  return ApiResponse.<T>builder()
  .success(false)
  .message(message)
  .error(error)
  .build();
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public static class ErrorDetails {
  private String code;
  private String field;
  private Object rejectedValue;
  private String details;
  }
  }`,
    'PageResponse.java': `package com.oerms.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
* Standard pagination response wrapper
  */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public class PageResponse<T> {

  private List<T> content;
  private int pageNumber;
  private int pageSize;
  private long totalElements;
  private int totalPages;
  private boolean first;
  private boolean last;
  private boolean empty;

  public static <T> PageResponse<T> of(List<T> content, int pageNumber, int pageSize,
  long totalElements, int totalPages) {
  return PageResponse.<T>builder()
  .content(content)
  .pageNumber(pageNumber)
  .pageSize(pageSize)
  .totalElements(totalElements)
  .totalPages(totalPages)
  .first(pageNumber == 0)
  .last(pageNumber >= totalPages - 1)
  .empty(content.isEmpty())
  .build();
  }
  }`,
    'PageRequest.java': `package com.oerms.common.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
* Standard pagination request DTO
  */
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public class PageRequest {

  @Min(value = 0, message = "Page number must be >= 0")
  @Builder.Default
  private int page = 0;

  @Min(value = 1, message = "Page size must be >= 1")
  @Max(value = 100, message = "Page size must be <= 100")
  @Builder.Default
  private int size = 10;

  @Builder.Default
  private String sortBy = "id";

  @Builder.Default
  private String sortDir = "asc";

  public org.springframework.data.domain.PageRequest toSpringPageRequest() {
  org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("desc")
  ? org.springframework.data.domain.Sort.by(sortBy).descending()
  : org.springframework.data.domain.Sort.by(sortBy).ascending();

       return org.springframework.data.domain.PageRequest.of(page, size, sort);
  }
  }`,
    'BusinessException.java': `package com.oerms.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
* Base business exception for application-level errors
  */
  @Getter
  public class BusinessException extends RuntimeException {

  private final String errorCode;
  private final HttpStatus status;
  private final Object details;

  public BusinessException(String message) {
  super(message);
  this.errorCode = "BUSINESS_ERROR";
  this.status = HttpStatus.BAD_REQUEST;
  this.details = null;
  }

  public BusinessException(String message, String errorCode) {
  super(message);
  this.errorCode = errorCode;
  this.status = HttpStatus.BAD_REQUEST;
  this.details = null;
  }

  public BusinessException(String message, String errorCode, HttpStatus status) {
  super(message);
  this.errorCode = errorCode;
  this.status = status;
  this.details = null;
  }

  public BusinessException(String message, String errorCode, HttpStatus status, Object details) {
  super(message);
  this.errorCode = errorCode;
  this.status = status;
  this.details = details;
  }
  }`,
    'ResourceNotFoundException.java': `package com.oerms.common.exception;

import org.springframework.http.HttpStatus;

/**
* Exception thrown when a requested resource is not found
  */
  public class ResourceNotFoundException extends BusinessException {

  public ResourceNotFoundException(String resource, String field, Object value) {
  super(
  String.format("%s not found with %s: '%s'", resource, field, value),
  "RESOURCE_NOT_FOUND",
  HttpStatus.NOT_FOUND
  );
  }

  public ResourceNotFoundException(String message) {
  super(message, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND);
  }
  }`,
    'ValidationException.java': `package com.oerms.common.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

/**
* Exception thrown for validation errors
  */
  public class ValidationException extends BusinessException {

  public ValidationException(String message) {
  super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
  }

  public ValidationException(String message, Map<String, String> errors) {
  super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST, errors);
  }
  }`,
    'UnauthorizedException.java': `package com.oerms.common.exception;

import org.springframework.http.HttpStatus;

/**
* Exception thrown for authentication/authorization errors
  */
  public class UnauthorizedException extends BusinessException {

  public UnauthorizedException(String message) {
  super(message, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
  }

  public UnauthorizedException() {
  super("Unauthorized access", "UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
  }
  }`,
    'DuplicateResourceException.java': `package com.oerms.common.exception;

import org.springframework.http.HttpStatus;

/**
* Exception thrown when attempting to create a duplicate resource
  */
  public class DuplicateResourceException extends BusinessException {

  public DuplicateResourceException(String resource, String field, Object value) {
  super(
  String.format("%s already exists with %s: '%s'", resource, field, value),
  "DUPLICATE_RESOURCE",
  HttpStatus.CONFLICT
  );
  }

  public DuplicateResourceException(String message) {
  super(message, "DUPLICATE_RESOURCE", HttpStatus.CONFLICT);
  }
  }`,
    'AppConstants.java': `package com.oerms.common.constant;

/**
* Application-wide constants
  */
  public final class AppConstants {

  private AppConstants() {
  throw new UnsupportedOperationException("This is a utility class");
  }

  // Pagination
  public static final int DEFAULT_PAGE_SIZE = 10;
  public static final int MAX_PAGE_SIZE = 100;
  public static final String DEFAULT_SORT_BY = "id";
  public static final String DEFAULT_SORT_DIR = "asc";

  // Date Time Formats
  public static final String DATE_FORMAT = "yyyy-MM-dd";
  public static final String DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
  public static final String TIME_ZONE = "UTC";

  // Security
  public static final String AUTHORIZATION_HEADER = "Authorization";
  public static final String BEARER_PREFIX = "Bearer ";
  public static final String ROLE_PREFIX = "ROLE_";

  // JWT Claims
  public static final String CLAIM_USER_ID = "userId";
  public static final String CLAIM_EMAIL = "email";
  public static final String CLAIM_ROLES = "roles";
  public static final String CLAIM_AUTHORITIES = "authorities";

  // Cache Names
  public static final String CACHE_USERS = "users";
  public static final String CACHE_EXAMS = "exams";
  public static final String CACHE_QUESTIONS = "questions";
  public static final String CACHE_RESULTS = "results";

  // Kafka Topics
  public static final String TOPIC_USER_EVENTS = "user-events";
  public static final String TOPIC_EXAM_EVENTS = "exam-events";
  public static final String TOPIC_ATTEMPT_EVENTS = "attempt-events";
  public static final String TOPIC_RESULT_EVENTS = "result-events";
  public static final String TOPIC_NOTIFICATION_EVENTS = "notification-events";

  // API Paths
  public static final String API_V1 = "/api/v1";
  public static final String HEALTH_PATH = "/actuator/health";
  public static final String METRICS_PATH = "/actuator/metrics";

  // File Upload
  public static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"};
  public static final String[] ALLOWED_DOCUMENT_TYPES = {"application/pdf"};

  // Validation Messages
  public static final String VALIDATION_REQUIRED = "This field is required";
  public static final String VALIDATION_EMAIL = "Invalid email format";
  public static final String VALIDATION_MIN_LENGTH = "Minimum length is {min}";
  public static final String VALIDATION_MAX_LENGTH = "Maximum length is {max}";
  }`,
    'ErrorCodes.java': `package com.oerms.common.constant;

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
  }`,
    'DateUtils.java': `package com.oerms.common.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

/**
* Utility class for date and time operations
  */
  public final class DateUtils {

  private DateUtils() {
  throw new UnsupportedOperationException("This is a utility class");
  }

  private static final DateTimeFormatter DEFAULT_FORMATTER =
  DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  public static LocalDateTime now() {
  return LocalDateTime.now();
  }

  public static String format(LocalDateTime dateTime) {
  return dateTime != null ? dateTime.format(DEFAULT_FORMATTER) : null;
  }

  public static String format(LocalDateTime dateTime, String pattern) {
  return dateTime != null ? dateTime.format(DateTimeFormatter.ofPattern(pattern)) : null;
  }

  public static LocalDateTime parse(String dateTimeString) {
  return dateTimeString != null ? LocalDateTime.parse(dateTimeString, DEFAULT_FORMATTER) : null;
  }

  public static LocalDateTime parse(String dateTimeString, String pattern) {
  return dateTimeString != null ?
  LocalDateTime.parse(dateTimeString, DateTimeFormatter.ofPattern(pattern)) : null;
  }

  public static Date toDate(LocalDateTime localDateTime) {
  return localDateTime != null ?
  Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant()) : null;
  }

  public static LocalDateTime toLocalDateTime(Date date) {
  return date != null ?
  LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()) : null;
  }

  public static boolean isBetween(LocalDateTime dateTime, LocalDateTime start, LocalDateTime end) {
  return dateTime != null && start != null && end != null &&
  (dateTime.isEqual(start) || dateTime.isAfter(start)) &&
  (dateTime.isEqual(end) || dateTime.isBefore(end));
  }

  public static boolean isExpired(LocalDateTime dateTime) {
  return dateTime != null && dateTime.isBefore(LocalDateTime.now());
  }
  }`,
    'StringUtils.java': `package com.oerms.common.util;

import java.util.UUID;

/**
* Utility class for string operations
  */
  public final class StringUtils {

  private StringUtils() {
  throw new UnsupportedOperationException("This is a utility class");
  }

  public static boolean isEmpty(String str) {
  return str == null || str.trim().isEmpty();
  }

  public static boolean isNotEmpty(String str) {
  return !isEmpty(str);
  }

  public static String generateUUID() {
  return UUID.randomUUID().toString();
  }

  public static String generateShortUUID() {
  return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
  }

  public static String maskEmail(String email) {
  if (isEmpty(email) || !email.contains("@")) {
  return email;
  }
  String[] parts = email.split("@");
  String username = parts[0];
  String domain = parts[1];

       if (username.length() <= 2) {
           return username.charAt(0) + "***@" + domain;
       }
       
       return username.charAt(0) + "***" + username.charAt(username.length() - 1) + "@" + domain;
  }

  public static String capitalize(String str) {
  if (isEmpty(str)) {
  return str;
  }
  return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
  }

  public static String truncate(String str, int maxLength) {
  if (str == null || str.length() <= maxLength) {
  return str;
  }
  return str.substring(0, maxLength) + "...";
  }
  }`,
    'ValidationUtils.java': `package com.oerms.common.util;

import com.oerms.common.exception.ValidationException;
import org.apache.commons.lang3.StringUtils;

import java.util.regex.Pattern;

/**
* Utility class for validation operations
  */
  public final class ValidationUtils {

  private ValidationUtils() {
  throw new UnsupportedOperationException("This is a utility class");
  }

  private static final Pattern EMAIL_PATTERN =
  Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

  private static final Pattern PHONE_PATTERN =
  Pattern.compile("^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$");

  public static void validateEmail(String email) {
  if (StringUtils.isBlank(email)) {
  throw new ValidationException("Email cannot be empty");
  }
  if (!EMAIL_PATTERN.matcher(email).matches()) {
  throw new ValidationException("Invalid email format");
  }
  }

  public static void validatePhone(String phone) {
  if (StringUtils.isNotBlank(phone) && !PHONE_PATTERN.matcher(phone).matches()) {
  throw new ValidationException("Invalid phone number format");
  }
  }

  public static void validateNotNull(Object object, String fieldName) {
  if (object == null) {
  throw new ValidationException(fieldName + " cannot be null");
  }
  }

  public static void validateNotEmpty(String value, String fieldName) {
  if (StringUtils.isBlank(value)) {
  throw new ValidationException(fieldName + " cannot be empty");
  }
  }

  public static void validateLength(String value, String fieldName, int minLength, int maxLength) {
  if (value == null) return;

       if (value.length() < minLength) {
           throw new ValidationException(
               String.format("%s must be at least %d characters", fieldName, minLength)
           );
       }
       if (value.length() > maxLength) {
           throw new ValidationException(
               String.format("%s must not exceed %d characters", fieldName, maxLength)
           );
       }
  }

  public static void validateRange(Number value, String fieldName, Number min, Number max) {
  if (value == null) return;

       double doubleValue = value.doubleValue();
       double minValue = min.doubleValue();
       double maxValue = max.doubleValue();
       
       if (doubleValue < minValue || doubleValue > maxValue) {
           throw new ValidationException(
               String.format("%s must be between %s and %s", fieldName, min, max)
           );
       }
  }

  public static boolean isValidEmail(String email) {
  return StringUtils.isNotBlank(email) && EMAIL_PATTERN.matcher(email).matches();
  }

  public static boolean isValidPhone(String phone) {
  return StringUtils.isNotBlank(phone) && PHONE_PATTERN.matcher(phone).matches();
  }
  }