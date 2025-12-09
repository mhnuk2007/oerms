package com.oerms.exam.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.UserProfileDTO;
import com.oerms.exam.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@FeignClient(
    name = "user-service",
    path = "/api/users",
    configuration = FeignClientConfig.class,
    fallback = UserServiceFallback.class
)
public interface UserServiceClient {

    @GetMapping("/profile/{userId}")
    ApiResponse<UserProfileDTO> getUserProfile(@PathVariable("userId") UUID userId);

    @PostMapping("/profiles/batch")
    ApiResponse<List<UserProfileDTO>> getUsersByIds(@RequestBody List<UUID> userIds);
}

@Component
class UserServiceFallback implements UserServiceClient {
    @Override
    public ApiResponse<UserProfileDTO> getUserProfile(UUID userId) {
        return ApiResponse.<UserProfileDTO>builder().success(false).message("Fallback").build();
    }

    @Override
    public ApiResponse<List<UserProfileDTO>> getUsersByIds(List<UUID> userIds) {
        return ApiResponse.<List<UserProfileDTO>>builder().success(false).message("Fallback").build();
    }
}
