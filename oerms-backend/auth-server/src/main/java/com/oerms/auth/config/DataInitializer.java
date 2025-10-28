package com.oerms.auth.config;

import com.oerms.auth.entity.User;
import com.oerms.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Check if users already exist
            if (userRepository.count() == 0) {
                // Create Admin user
                User admin = User.builder()
                        .email("admin@oerms.com")
                        .password(passwordEncoder.encode("admin123"))
                        .name("Admin User")
                        .roles(Set.of("ADMIN", "TEACHER"))
                        .enabled(true)
                        .build();

                // Create Teacher user
                User teacher = User.builder()
                        .email("teacher@oerms.com")
                        .password(passwordEncoder.encode("teacher123"))
                        .name("Teacher User")
                        .roles(Set.of("TEACHER"))
                        .enabled(true)
                        .build();

                // Create Student user
                User student = User.builder()
                        .email("student@oerms.com")
                        .password(passwordEncoder.encode("student123"))
                        .name("Student User")
                        .roles(Set.of("STUDENT"))
                        .enabled(true)
                        .build();

                userRepository.save(admin);
                userRepository.save(teacher);
                userRepository.save(student);

                System.out.println("=== Test Users Created ===");
                System.out.println("Admin: admin@oerms.com / admin123");
                System.out.println("Teacher: teacher@oerms.com / teacher123");
                System.out.println("Student: student@oerms.com / student123");
            }
        };
    }
}