package com.oerms.gateway.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.route.RouteDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.*;

/**
 * Endpoint to list all available OpenAPI documentation URLs
 */
@RestController
@RequiredArgsConstructor
public class OpenApiController {
    
    private final RouteDefinitionLocator locator;
    
    @GetMapping("/v3/api-docs")
    public Mono<ResponseEntity<Map<String, Object>>> getApiDocs() {
        return Mono.just(ResponseEntity.ok(Map.of(
            "swagger", "3.0.1",
            "info", Map.of(
                "title", "OERMS API Gateway",
                "description", "Aggregated API Documentation for all microservices",
                "version", "1.0.0"
            ),
            "servers", List.of(
                Map.of("url", "http://localhost:8080", "description", "API Gateway")
            ),
            "paths", Map.of()
        )));
    }
    
    @GetMapping("/v3/api-docs/services")
    public Mono<ResponseEntity<List<Map<String, String>>>> getAvailableServices() {
        List<Map<String, String>> services = List.of(
            Map.of(
                "name", "Exam Service",
                "url", "/exam-service/v3/api-docs"
            ),
            Map.of(
                "name", "Question Service",
                "url", "/question-service/v3/api-docs"
            ),
            Map.of(
                "name", "User Service",
                "url", "/user-service/v3/api-docs"
            ),
            Map.of(
                "name", "Attempt Service",
                "url", "/attempt-service/v3/api-docs"
            ),
            Map.of(
                "name", "Result Service",
                "url", "/result-service/v3/api-docs"
            ),
            Map.of(
                "name", "Notification Service",
                "url", "/notification-service/v3/api-docs"
            )
        );
        
        return Mono.just(ResponseEntity.ok(services));
    }
}
