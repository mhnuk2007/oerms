package com.oerms.apigateway.config;

import com.oerms.apigateway.filter.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private AuthenticationFilter authenticationFilter;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // ============ USER SERVICE ROUTES ============

                // Public routes (no authentication required)
                .route("user-service-public", r -> r
                        .path("/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh")
                        .filters(f -> f
                                .addRequestHeader("X-Gateway", "OERMS-Gateway")
                                .circuitBreaker(config -> config
                                        .setName("userServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/user-service")))
                        .uri("lb://user-service"))

                // Protected routes (authentication required)
                .route("user-service-protected", r -> r
                        .path("/api/v1/auth/logout", "/api/v1/auth/me", "/api/v1/users/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .addRequestHeader("X-Gateway", "OERMS-Gateway")
                                .circuitBreaker(config -> config
                                        .setName("userServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/user-service")))
                        .uri("lb://user-service"))

                // ============ QUESTION SERVICE ROUTES ============
                .route("question-service", r -> r
                        .path("/api/v1/questions/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .addRequestHeader("X-Gateway", "OERMS-Gateway")
                                .circuitBreaker(config -> config
                                        .setName("questionServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/question-service")))
                        .uri("lb://question-service"))

                // ============ EXAM SERVICE ROUTES ============
                .route("exam-service", r -> r
                        .path("/api/v1/exams/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .addRequestHeader("X-Gateway", "OERMS-Gateway")
                                .circuitBreaker(config -> config
                                        .setName("examServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/exam-service")))
                        .uri("lb://exam-service"))

                // ============ RESULT SERVICE ROUTES ============
                .route("result-service", r -> r
                        .path("/api/v1/results/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .addRequestHeader("X-Gateway", "OERMS-Gateway")
                                .circuitBreaker(config -> config
                                        .setName("resultServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/result-service")))
                        .uri("lb://result-service"))

                // ============ ATTEMPT SERVICE ROUTES ============
                .route("attempt-service", r -> r
                        .path("/api/v1/attempts/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .addRequestHeader("X-Gateway", "OERMS-Gateway")
                                .circuitBreaker(config -> config
                                        .setName("attemptServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/attempt-service")))
                        .uri("lb://attempt-service"))

                // ============ NOTIFICATION SERVICE ROUTES ============
                .route("notification-service", r -> r
                        .path("/api/v1/notifications/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .addRequestHeader("X-Gateway", "OERMS-Gateway")
                                .circuitBreaker(config -> config
                                        .setName("notificationServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/notification-service")))
                        .uri("lb://notification-service"))

                .build();
    }
}