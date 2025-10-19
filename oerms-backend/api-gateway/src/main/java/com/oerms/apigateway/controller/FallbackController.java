package com.oerms.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
@CrossOrigin(origins = "http://localhost:3000")
public class FallbackController {

    @GetMapping("/user-service")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        return createFallbackResponse(
                "User Service",
                "The user service is currently unavailable. Please try again later."
        );
    }

    @GetMapping("/question-service")
    public ResponseEntity<Map<String, Object>> questionServiceFallback() {
        return createFallbackResponse(
                "Question Service",
                "The question service is currently unavailable. Please try again later."
        );
    }

    @GetMapping("/exam-service")
    public ResponseEntity<Map<String, Object>> examServiceFallback() {
        return createFallbackResponse(
                "Exam Service",
                "The exam service is currently unavailable. Please try again later."
        );
    }

    @GetMapping("/result-service")
    public ResponseEntity<Map<String, Object>> resultServiceFallback() {
        return createFallbackResponse(
                "Result Service",
                "The result service is currently unavailable. Please try again later."
        );
    }

    @GetMapping("/notification-service")
    public ResponseEntity<Map<String, Object>> notificationServiceFallback() {
        return createFallbackResponse(
                "Notification Service",
                "The notification service is currently unavailable. Please try again later."
        );
    }

    private ResponseEntity<Map<String, Object>> createFallbackResponse(String serviceName, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "SERVICE_UNAVAILABLE");
        response.put("message", message);
        response.put("service", serviceName);
        response.put("timestamp", Instant.now().toString());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(response);
    }
}