package com.oerms.gateway.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info; // annotation import
import io.swagger.v3.oas.models.OpenAPI;       // OpenAPI model
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "API Gateway Service",
                version = "1.0.0",
                description = "API Gateway Service"
        )
)
@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(
                new io.swagger.v3.oas.models.info.Info()
                .title("API Gateway Service")
                .description("API Gateway Service")
                .version("1.0.0"));
    }
}