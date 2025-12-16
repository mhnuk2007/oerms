package com.oerms.result.config;

import com.oerms.result.security.OAuth2ClientCredentialsManager;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration // This annotation is crucial for the child context to find the necessary beans.
@RequiredArgsConstructor
public class FeignM2MConfig {

    private final OAuth2ClientCredentialsManager clientCredentialsManager;

    @Bean
    public RequestInterceptor m2mRequestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                String token = clientCredentialsManager.getToken();
                template.header("Authorization", "Bearer " + token);
            }
        };
    }
}
