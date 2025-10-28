package com.oerms.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Component
public class RoleCheckGatewayFilterFactory extends AbstractGatewayFilterFactory<RoleCheckGatewayFilterFactory.Config> {

    public RoleCheckGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> ReactiveSecurityContextHolder.getContext()
                .map(securityContext -> securityContext.getAuthentication())
                .filter(authentication -> authentication.getPrincipal() instanceof Jwt)
                .map(authentication -> (Jwt) authentication.getPrincipal())
                .flatMap(jwt -> {
                    String roles = jwt.getClaimAsString("roles");
                    
                    if (roles == null || !roles.contains(config.getRole())) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.FORBIDDEN, 
                                "Access denied. Required role: " + config.getRole()
                        ));
                    }
                    
                    return chain.filter(exchange);
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    public static class Config {
        private String role;

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}