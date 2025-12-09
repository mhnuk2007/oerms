//package com.oerms.user.service;
//
//import com.oerms.user.client.AuthServiceClient;
//import com.oerms.common.dto.UpdateUserRequest;
//import com.oerms.common.dto.UserResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//public class UserService {
//
//    private final AuthServiceClient authServiceClient;
//    private final UserSyncService userSyncService; // To get user profiles
//
//    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {
//        // Delegate the update command to the auth-server
//        return authServiceClient.updateUser(userId, request).getData();
//    }
//}
