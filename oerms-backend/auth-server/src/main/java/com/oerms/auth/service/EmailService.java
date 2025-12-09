//package com.oerms.auth.service;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.scheduling.annotation.Async;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class EmailService {
//
//    private final JavaMailSender mailSender;
//
//    @Value("${app.mail.from}")
//    private String fromEmail;
//
//    @Value("${app.frontend.url}")
//    private String frontendUrl;
//
//    @Async
//    public void sendVerificationEmail(String to, String fullName, String token) {
//        try {
//            String verificationUrl = frontendUrl + "/verify-email?token=" + token;
//
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setFrom(fromEmail);
//            message.setTo(to);
//            message.setSubject("OERMS - Verify Your Email Address");
//            message.setText(String.format(
//                "Dear %s,\n\n" +
//                "Thank you for registering with OERMS!\n\n" +
//                "Please click the link below to verify your email address:\n" +
//                "%s\n\n" +
//                "This link will expire in 24 hours.\n\n" +
//                "If you did not create this account, please ignore this email.\n\n" +
//                "Best regards,\n" +
//                "OERMS Team",
//                fullName, verificationUrl
//            ));
//
//            mailSender.send(message);
//            log.info("Verification email sent to: {}", to);
//        } catch (Exception e) {
//            log.error("Failed to send verification email to: {}", to, e);
//        }
//    }
//
//    @Async
//    public void sendPasswordResetEmail(String to, String fullName, String token) {
//        try {
//            String resetUrl = frontendUrl + "/reset-password?token=" + token;
//
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setFrom(fromEmail);
//            message.setTo(to);
//            message.setSubject("OERMS - Password Reset Request");
//            message.setText(String.format(
//                "Dear %s,\n\n" +
//                "We received a request to reset your password.\n\n" +
//                "Please click the link below to reset your password:\n" +
//                "%s\n\n" +
//                "This link will expire in 1 hour.\n\n" +
//                "If you did not request a password reset, please ignore this email or contact support.\n\n" +
//                "Best regards,\n" +
//                "OERMS Team",
//                fullName, resetUrl
//            ));
//
//            mailSender.send(message);
//            log.info("Password reset email sent to: {}", to);
//        } catch (Exception e) {
//            log.error("Failed to send password reset email to: {}", to, e);
//        }
//    }
//
//    @Async
//    public void sendWelcomeEmail(String to, String fullName) {
//        try {
//            SimpleMailMessage message = new SimpleMailMessage();
//            message.setFrom(fromEmail);
//            message.setTo(to);
//            message.setSubject("Welcome to OERMS!");
//            message.setText(String.format(
//                "Dear %s,\n\n" +
//                "Welcome to the Online Exam & Result Management System!\n\n" +
//                "Your email has been verified and your account is now active.\n\n" +
//                "You can now log in and start using all the features of OERMS.\n\n" +
//                "Best regards,\n" +
//                "OERMS Team",
//                fullName
//            ));
//
//            mailSender.send(message);
//            log.info("Welcome email sent to: {}", to);
//        } catch (Exception e) {
//            log.error("Failed to send welcome email to: {}", to, e);
//        }
//    }
//}