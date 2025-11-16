package com.oerms.gateway.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.properties.AbstractSwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * OpenAPI Configuration for API Gateway
 * Aggregates all microservice OpenAPI docs
 */
@Configuration
public class OpenApiConfig {

    private final RouteDefinitionLocator locator;

    public OpenApiConfig(RouteDefinitionLocator locator) {
        this.locator = locator;
    }

    @Bean
    @Lazy(false)
    public Set<AbstractSwaggerUiConfigProperties.SwaggerUrl> apis() {
        Set<AbstractSwaggerUiConfigProperties.SwaggerUrl> urls = new HashSet<>();

        // Manually define service URLs
        urls.add(createSwaggerUrl("Auth Server", "/auth-server/v3/api-docs"));
        urls.add(createSwaggerUrl("Exam Service", "/exam-service/v3/api-docs"));
        urls.add(createSwaggerUrl("Question Service", "/question-service/v3/api-docs"));
        urls.add(createSwaggerUrl("User Service", "/user-service/v3/api-docs"));
        urls.add(createSwaggerUrl("Attempt Service", "/attempt-service/v3/api-docs"));
        urls.add(createSwaggerUrl("Result Service", "/result-service/v3/api-docs"));
        urls.add(createSwaggerUrl("Notification Service", "/notification-service/v3/api-docs"));

        return urls;
    }

    private AbstractSwaggerUiConfigProperties.SwaggerUrl createSwaggerUrl(String name, String url) {
        AbstractSwaggerUiConfigProperties.SwaggerUrl swaggerUrl =
                new AbstractSwaggerUiConfigProperties.SwaggerUrl();
        swaggerUrl.setName(name);
        swaggerUrl.setUrl(url);
        return swaggerUrl;
    }
}