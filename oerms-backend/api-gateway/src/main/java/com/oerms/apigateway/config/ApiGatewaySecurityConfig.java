package com.oerms.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security Configuration for API Gateway
 * Uses WebFlux Security (reactive) for Spring Cloud Gateway
 *
 * NOTE: This configuration handles CORS and basic security.
 * JWT validation is done by AuthenticationFilter in GatewayConfig routes.
 *
 * @author OERMS Team
 */
@Configuration
@EnableWebFluxSecurity
public class ApiGatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeExchange(auth -> auth
                        // Allow all requests - authentication is handled by AuthenticationFilter
                        .anyExchange().permitAll()
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        // Allowed origins
        corsConfiguration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://oerms.com"
        ));

        // Allowed methods
        corsConfiguration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allowed headers
        corsConfiguration.setAllowedHeaders(List.of("*"));

        // Allow credentials
        corsConfiguration.setAllowCredentials(true);

        // Exposed headers (for frontend to read)
        corsConfiguration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "X-User-Id",
                "X-User-Email",
                "X-User-Roles"
        ));

        // Max age
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }
}