// src/main/java/com/doan2/nguyentuanthao_doan/controller/AuthController.java
package com.doan2.nguyenthuanthao_doan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doan2.nguyenthuanthao_doan.dto.auth.AuthRequest;
import com.doan2.nguyenthuanthao_doan.dto.auth.AuthResponse;
import com.doan2.nguyenthuanthao_doan.dto.auth.RegisterRequest;
import com.doan2.nguyenthuanthao_doan.service.AuthenticationService;

import jakarta.validation.Valid; // Thêm import này
import lombok.RequiredArgsConstructor; // Thêm import này

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

@PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) { // <-- THÊM @Valid
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
@GetMapping("/test-auth")
    public ResponseEntity<String> testAuthentication(Authentication authentication) {
    // Trả về tên của người dùng đã được xác thực
    return ResponseEntity.ok("Xin chào, " + authentication.getName() + "! Token của bạn HỢP LỆ.");
}
}