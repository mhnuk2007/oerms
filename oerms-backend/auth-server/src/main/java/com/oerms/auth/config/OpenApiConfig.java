package com.oerms.auth.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.Paths;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.RequestBody;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI authServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("OERMS Auth Server API")
                        .description("API documentation for Authentication, Authorization, and User Management Service")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("OERMS Team")
                                .email("support@oerms.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server().url("http://localhost:9000").description("Direct Access"),
                        new Server().url("http://localhost:8080").description("Via API Gateway")
                ))
                // 1. Manually add the Paths for OAuth2 endpoints
                .paths(new Paths()
                        .addPathItem("/oauth2/token", new PathItem()
                                .post(new Operation()
                                        .tags(List.of("OAuth2 Token Endpoint"))
                                        .summary("Get Access Token")
                                        .description("Endpoint to obtain access and refresh tokens using standard grant types.")
                                        .operationId("getToken")
                                        .requestBody(new RequestBody()
                                                .content(new Content()
                                                        .addMediaType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED_VALUE,
                                                                new MediaType().schema(new Schema<Map<String, Object>>()
                                                                        .addProperty("grant_type", new StringSchema()._default("password").description("Grant Type (password, refresh_token, client_credentials, authorization_code)"))
                                                                        .addProperty("username", new StringSchema().description("User's username (required for password grant)"))
                                                                        .addProperty("password", new StringSchema().description("User's password (required for password grant)"))
                                                                        .addProperty("scope", new StringSchema()._default("openid profile email read write"))
                                                                        .addProperty("refresh_token", new StringSchema().description("Refresh Token (required for refresh_token grant)"))
                                                                        .addProperty("code", new StringSchema().description("Authorization Code (required for authorization_code grant)"))
                                                                        .addProperty("client_id", new StringSchema()._default("oerms-service"))
                                                                        .addProperty("client_secret", new StringSchema()._default("service-secret"))
                                                                ))))
                                        .responses(new ApiResponses()
                                                .addApiResponse("200", new ApiResponse().description("Access Token Generated"))
                                                .addApiResponse("400", new ApiResponse().description("Invalid Request"))
                                                .addApiResponse("401", new ApiResponse().description("Unauthorized"))
                                        )
                                )
                        )
                        // Optional: Add Introspect or Revoke if needed
                        .addPathItem("/oauth2/jwks", new PathItem()
                                .get(new Operation()
                                        .tags(List.of("OAuth2 Token Endpoint"))
                                        .summary("Get JSON Web Key Set")
                                        .description("Endpoint to retrieve the public keys used to verify the JWT signatures.")
                                        .responses(new ApiResponses()
                                                .addApiResponse("200", new ApiResponse().description("Keys Retrieved"))
                                        )
                                )
                        )
                )
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token obtained from this server's /oauth2/token endpoint")));
    }
}