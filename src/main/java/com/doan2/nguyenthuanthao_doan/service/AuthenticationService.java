// src/main/java/com/doan2/nguyentuanthao_doan/service/AuthenticationService.java
package com.doan2.nguyenthuanthao_doan.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.doan2.nguyenthuanthao_doan.config.security.JwtService;
import com.doan2.nguyenthuanthao_doan.dto.auth.AuthRequest;
import com.doan2.nguyenthuanthao_doan.dto.auth.AuthResponse;
import com.doan2.nguyenthuanthao_doan.dto.auth.RegisterRequest;
import com.doan2.nguyenthuanthao_doan.entity.User;
import com.doan2.nguyenthuanthao_doan.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok annotation to create constructor with all final fields
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        var user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER"); // Mặc định role là USER

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).build();
    }
}