//package com.oerms.user.controller;
//
//import com.oerms.common.dto.ApiResponse;
//import com.oerms.common.dto.UpdateUserRequest;
//import com.oerms.common.dto.UserResponse;
//import com.oerms.user.service.UserService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/api/users")
//@RequiredArgsConstructor
//public class UserController {
//
//    private final UserService userService;
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN') or #id.toString() == authentication.principal.claims['userId']")
//    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
//            @PathVariable UUID id,
//            @Valid @RequestBody UpdateUserRequest request) {
//        UserResponse updatedUser = userService.updateUser(id, request);
//        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
//    }
//}
