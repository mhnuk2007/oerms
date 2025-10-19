package com.oerms.apigateway.filter;

import com.oerms.apigateway.service.UserServiceClient;
import com.oerms.apigateway.service.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Authentication filter that validates JWT tokens
 * Integrates with User Service for token validation
 *
 * @author OERMS Team
 */
@Slf4j
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserServiceClient userServiceClient;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().toString();

            log.debug("Processing authentication for path: {}", path);

            // Check for Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing authorization header for path: {}", path);
                return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid authorization header format for path: {}", path);
                return onError(exchange, "Invalid authorization header format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // Step 1: Basic token validation (signature & expiration)
                if (!jwtService.isTokenValid(token)) {
                    log.warn("Token failed basic validation for path: {}", path);
                    return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
                }

                // Step 2: Extract user info from token
                String userId = jwtService.extractUserId(token);
                String email = jwtService.extractEmail(token);
                List<String> roles = jwtService.extractRoles(token);

                log.debug("Token parsed - User: {}, Roles: {}", email, roles);

                // Step 3: Validate token with User Service (checks blacklist, etc.)
                return userServiceClient.validateToken(token)
                        .flatMap(isValid -> {
                            if (!isValid) {
                                log.warn("Token validation failed in User Service for user: {}", email);
                                return onError(exchange, "Token has been revoked or is invalid", HttpStatus.UNAUTHORIZED);
                            }

                            log.debug("Token validated successfully for user: {}", email);

                            // Step 4: Add user information to request headers for downstream services
                            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                                    .header("X-User-Id", userId)
                                    .header("X-User-Email", email)
                                    .header("X-User-Roles", String.join(",", roles))
                                    .header("X-Auth-Token", token)
                                    .build();

                            return chain.filter(exchange.mutate().request(modifiedRequest).build());
                        })
                        .onErrorResume(error -> {
                            log.error("Error validating token with User Service: {}", error.getMessage());
                            return onError(exchange, "Authentication service unavailable", HttpStatus.SERVICE_UNAVAILABLE);
                        });

            } catch (Exception e) {
                log.error("Token validation error for path {}: {}", path, e.getMessage());
                return onError(exchange, "Token validation failed: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        String errorResponse = String.format(
                "{\"error\":\"%s\",\"message\":\"%s\",\"timestamp\":\"%s\",\"path\":\"%s\"}",
                httpStatus.name(),
                message,
                java.time.Instant.now().toString(),
                exchange.getRequest().getPath().toString()
        );
        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(errorResponse.getBytes()))
        );
    }

    public static class Config {
        // Configuration properties if needed
    }
}