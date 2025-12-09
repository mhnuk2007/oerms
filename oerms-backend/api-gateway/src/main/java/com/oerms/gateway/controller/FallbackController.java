package com.oerms.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class FallbackController {

    @RequestMapping("/fallback/user-service")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        return createFallbackResponse("User Service is currently unavailable");
    }

    @RequestMapping("/fallback/exam-service")
    public ResponseEntity<Map<String, Object>> examServiceFallback() {
        return createFallbackResponse("Exam Service is currently unavailable");
    }

    @RequestMapping("/fallback/attempt-service")
    public ResponseEntity<Map<String, Object>> attemptServiceFallback() {
        return createFallbackResponse("Attempt Service is currently unavailable");
    }

    @RequestMapping("/fallback/question-service")
    public ResponseEntity<Map<String, Object>> questionServiceFallback() {
        return createFallbackResponse("Question Service is currently unavailable");
    }

    @RequestMapping("/fallback/result-service")
    public ResponseEntity<Map<String, Object>> resultServiceFallback() {
        return createFallbackResponse("Result Service is currently unavailable");
    }

    @RequestMapping("/fallback/notification-service")
    public ResponseEntity<Map<String, Object>> notificationServiceFallback() {
        return createFallbackResponse("Notification Service is currently unavailable");
    }

    @RequestMapping("/fallback/auth-server")
    public ResponseEntity<Map<String, Object>> authServerFallback() {
        return createFallbackResponse("Auth Server is currently unavailable");
    }

    private ResponseEntity<Map<String, Object>> createFallbackResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", message);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}