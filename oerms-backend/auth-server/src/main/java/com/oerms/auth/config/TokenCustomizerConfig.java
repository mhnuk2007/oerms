//package com.oerms.auth.config;
//
//import com.oerms.auth.security.CustomUserDetails;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
//import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
//
//@Configuration
//public class TokenCustomizerConfig {
//
//    @Bean
//    public OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer(UserDetailsService userDetailsService) {
//        return context -> {
//            if (context.getPrincipal() != null) {
//                var userDetails = (CustomUserDetails)
//                    userDetailsService.loadUserByUsername(context.getPrincipal().getName());
//
//                // Add custom claims
//                context.getClaims().claim("userId", userDetails.getUserId().toString());
//                context.getClaims().claim("username", userDetails.getUsername());
//                context.getClaims().claim("authorities",
//                    userDetails.getAuthorities().stream()
//                        .map(a -> a.getAuthority())
//                        .toList()
//                );
//            }
//        };
//    }
//}