package com.oerms.authserver.gen;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123"; // change this as needed
        String encoded = encoder.encode(rawPassword);
        System.out.println("BCrypt hash: " + encoded);
    }
}
