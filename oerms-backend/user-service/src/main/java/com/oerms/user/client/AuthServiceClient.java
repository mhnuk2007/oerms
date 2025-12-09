//package com.oerms.user.client;
//
//import com.oerms.common.dto.ApiResponse;
//import com.oerms.common.dto.UpdateUserRequest;
//import com.oerms.common.dto.UserResponse;
//import org.springframework.cloud.openfeign.FeignClient;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//
//import java.util.UUID;
//
//@FeignClient(name = "auth-server", path = "/api/auth")
//public interface AuthServiceClient {
//
//    @PutMapping("/users/{id}")
//    ApiResponse<UserResponse> updateUser(@PathVariable("id") UUID id, @RequestBody UpdateUserRequest request);
//}
