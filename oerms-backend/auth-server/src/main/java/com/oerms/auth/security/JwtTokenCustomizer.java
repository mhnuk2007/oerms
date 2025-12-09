//package com.oerms.auth.security;
//
//import com.oerms.auth.entity.User;
//import com.oerms.auth.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
//import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
//import org.springframework.stereotype.Component;
//
//import java.util.stream.Collectors;
//
//@Component
//@RequiredArgsConstructor
//public class JwtTokenCustomizer implements OAuth2TokenCustomizer<JwtEncodingContext> {
//
//    private final UserRepository userRepository;
//
//    @Override
//    public void customize(JwtEncodingContext context) {
//        String email = context.getPrincipal().getName();
//
//        userRepository.findByEmail(email).ifPresent(user -> {
//            context.getClaims()
//                    .claim("userId", user.getId().toString())
//                    .claim("email", user.getEmail())
//                    .claim("fullName", user.getFullName())
//                    .claim("roles", user.getRoles().stream()
//                            .map(role -> "ROLE_" + role.name())
//                            .collect(Collectors.toSet()))
//                    .claim("emailVerified", user.getEmailVerified())
//                    .claim("enabled", user.getEnabled());
//        });
//    }
//}