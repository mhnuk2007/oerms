package com.oerms.user.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    // Any authenticated user can access their profile
    @GetMapping("/profile")
    public Map<String, Object> getProfile(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
                "email", jwt.getSubject(),
                "roles", jwt.getClaimAsString("roles"),
                "name", "User Name" // Fetch from database
        );
    }

    // Only ADMIN can access
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public String getAllUsers() {
        return "List of all users - Admin only";
    }

    // ADMIN or TEACHER can access
    @GetMapping("/teacher/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public String getStudents() {
        return "List of students - Teacher/Admin only";
    }

    // Only the user themselves can update their profile
    @PutMapping("/profile")
    @PreAuthorize("authentication.principal.subject == #email")
    public String updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestParam String email) {
        return "Profile updated for: " + jwt.getSubject();
    }

    // Custom role check example
    @DeleteMapping("/admin/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteUser(@PathVariable Long id) {
        return "User deleted - Admin only";
    }

    // Check specific claim in JWT
    @GetMapping("/check-access")
    public Map<String, Object> checkAccess(@AuthenticationPrincipal Jwt jwt) {
        String roles = jwt.getClaimAsString("roles");
        String email = jwt.getSubject();

        return Map.of(
                "email", email,
                "roles", roles,
                "isAdmin", roles.contains("ADMIN"),
                "isTeacher", roles.contains("TEACHER"),
                "isStudent", roles.contains("STUDENT")
        );
    }
}
