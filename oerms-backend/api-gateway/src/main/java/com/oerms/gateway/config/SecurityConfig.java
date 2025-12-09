package com.oerms.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtGrantedAuthoritiesConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {

        http
                // CORS is handled by Spring Cloud Gateway global configuration in YAML
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())

                .authorizeExchange(exchanges -> exchanges

                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Static resources & favicon
                        .pathMatchers(
                                "/favicon.ico",
                                "/robots.txt",
                                "/static/**",
                                "/*.ico",
                                "/*.png",
                                "/*.jpg",
                                "/*.css",
                                "/*.js"
                        ).permitAll()

                        // Actuator & monitoring
                        .pathMatchers(
                                "/actuator/health",
                                "/actuator/info",
                                "/actuator/prometheus",
                                "/actuator/gateway/**"
                        ).permitAll()

                        // Swagger / API Docs
                        .pathMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/webjars/**",
                                "/fallback/**",
                                "/files/**",

                                "/auth-server/v3/api-docs/**",
                                "/exam-service/v3/api-docs/**",
                                "/question-service/v3/api-docs/**",
                                "/user-service/v3/api-docs/**",
                                "/attempt-service/v3/api-docs/**",
                                "/result-service/v3/api-docs/**",
                                "/notification-service/v3/api-docs/**"
                        ).permitAll()

                        // OIDC + Authorization Server endpoints
                        .pathMatchers(
                                "/oauth2/**",
                                "/login/**",
                                "/logout/**",
                                "/api/auth/register",
                                "/oauth2/jwks",
                                "/.well-known/openid-configuration",
                                "/.well-known/oauth-authorization-server"
                        ).permitAll()

                        // Everything else
                        .anyExchange().authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        return NimbusReactiveJwtDecoder.withIssuerLocation(issuerUri).build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
        grantedAuthoritiesConverter.setAuthorityPrefix("");

        ReactiveJwtAuthenticationConverter converter =
                new ReactiveJwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                new ReactiveJwtGrantedAuthoritiesConverterAdapter(grantedAuthoritiesConverter)
        );

        return converter;
    }
}