// src/main/java/com/doan2/nguyenthuanthao_doan/service/UserService.java
package com.doan2.nguyenthuanthao_doan.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doan2.nguyenthuanthao_doan.dto.ChangePasswordRequest;
import com.doan2.nguyenthuanthao_doan.dto.UpdateProfileRequest;
import com.doan2.nguyenthuanthao_doan.entity.User;
import com.doan2.nguyenthuanthao_doan.exception.ResourceNotFoundException;
import com.doan2.nguyenthuanthao_doan.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder

    // --- Lấy User hiện tại (Hàm helper) ---
    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("User must be authenticated.");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + username));
    }

    // --- Cập nhật Profile (Họ tên, Email) ---
    @Transactional
    public User updateProfile(UpdateProfileRequest request) {
        User currentUser = getCurrentAuthenticatedUser();
        logger.info("Updating profile for user ID: {}", currentUser.getId());

        // Kiểm tra email mới có bị trùng với user khác không (nếu email thay đổi)
        if (!currentUser.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
             logger.warn("Attempt to update profile with existing email: {}", request.getEmail());
             // Ném lỗi để GlobalExceptionHandler bắt
             throw new IllegalArgumentException("Email already in use by another account.");
        }

        currentUser.setEmail(request.getEmail());
        currentUser.setFullName(request.getFullName());

        User updatedUser = userRepository.save(currentUser);
        logger.info("Profile updated successfully for user ID: {}", currentUser.getId());
        return updatedUser;
    }

    // --- Đổi Mật khẩu ---
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User currentUser = getCurrentAuthenticatedUser();
        logger.info("Attempting to change password for user ID: {}", currentUser.getId());

        // 1. Kiểm tra mật khẩu hiện tại có đúng không
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            logger.warn("Incorrect current password provided for user ID: {}", currentUser.getId());
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng.");
        }

        // 2. Kiểm tra mật khẩu mới và xác nhận có khớp không
        if (!request.getNewPassword().equals(request.getConfirmationPassword())) {
            logger.warn("New password and confirmation password do not match for user ID: {}", currentUser.getId());
            throw new IllegalArgumentException("Mật khẩu mới và mật khẩu xác nhận không khớp.");
        }

        // 3. (Tùy chọn) Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
        if (passwordEncoder.matches(request.getNewPassword(), currentUser.getPassword())) {
             logger.warn("New password cannot be the same as the old password for user ID: {}", currentUser.getId());
             throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu cũ.");
        }

        // 4. Cập nhật mật khẩu mới (đã mã hóa)
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
        logger.info("Password changed successfully for user ID: {}", currentUser.getId());
    }
}