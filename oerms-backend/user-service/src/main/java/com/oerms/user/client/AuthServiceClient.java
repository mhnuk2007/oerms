package com.oerms.user.client;

import com.oerms.user.dto.UserProfileDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-server")
public interface AuthServiceClient {

    @GetMapping("/users/{userId}")
    UserProfileDTO getUser(@PathVariable("userId") Long userId);

    @GetMapping("/users/username/{username}")
    UserProfileDTO getUserByUsername(@PathVariable("username") String username);

    @PutMapping("/users/{userId}")
    UserProfileDTO updateUser(@PathVariable("userId") Long userId, @RequestBody UserProfileDTO dto);
}
