// src/main/java/com/doan2/nguyenthuanthao_doan/controller/UserController.java
package com.doan2.nguyenthuanthao_doan.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity; // Import DTO
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doan2.nguyenthuanthao_doan.dto.ChangePasswordRequest;
import com.doan2.nguyenthuanthao_doan.dto.UpdateProfileRequest;
import com.doan2.nguyenthuanthao_doan.dto.UserDto;
import com.doan2.nguyenthuanthao_doan.entity.User;
import com.doan2.nguyenthuanthao_doan.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile") // Base path
@RequiredArgsConstructor
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    /**
     * API Lấy thông tin profile của người dùng hiện tại
     */
    @GetMapping
    public ResponseEntity<UserDto> getCurrentUserProfile(Authentication authentication) {
         // Spring Security sẽ tự động inject (tiêm) đối tượng Authentication
         // chứa thông tin user đã được xác thực từ JWT
         
         if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof User)) {
             // Nếu vì lý do nào đó không có thông tin xác thực, trả về 401
             logger.warn("Không thể lấy thông tin profile: Người dùng chưa được xác thực.");
             return ResponseEntity.status(401).build(); // Unauthorized
         }
         
         // Lấy đối tượng User từ Principal
         User currentUser = (User) authentication.getPrincipal();
         
         // Chuyển đổi sang DTO để trả về an toàn (không lộ mật khẩu)
         UserDto userDto = new UserDto();
         userDto.setUsername(currentUser.getUsername());
         userDto.setEmail(currentUser.getEmail());
         userDto.setFullName(currentUser.getFullName());
         userDto.setRole(currentUser.getRole());
         
         return ResponseEntity.ok(userDto); // Trả về 200 OK với thông tin DTO
    }

    /**
     * API Cập nhật thông tin profile (Họ tên, Email)
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        logger.info(">>> Nhận yêu cầu cập nhật profile: {}", request);
        try {
            User updatedUser = userService.updateProfile(request);
            
            // Chuyển đổi sang DTO để trả về
            UserDto userDto = new UserDto();
            userDto.setUsername(updatedUser.getUsername());
            userDto.setEmail(updatedUser.getEmail());
            userDto.setFullName(updatedUser.getFullName());
            userDto.setRole(updatedUser.getRole());
            
            logger.info("<<< Cập nhật profile thành công cho user: {}", updatedUser.getUsername());
            return ResponseEntity.ok(userDto);
        } catch (IllegalArgumentException e) {
             // Bắt lỗi nghiệp vụ (ví dụ: email trùng)
             logger.warn("!!! Cập nhật profile thất bại: {}", e.getMessage());
             return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
             // Bắt các lỗi không mong muốn khác
             logger.error("!!! Lỗi không xác định khi cập nhật profile: {}", e.getMessage(), e);
             throw e; // Để GlobalExceptionHandler xử lý (trả về 500)
        }
    }

    /**
     * API Đổi mật khẩu
     */
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
         logger.info(">>> Nhận yêu cầu đổi mật khẩu.");
         try {
            userService.changePassword(request);
            logger.info("<<< Đổi mật khẩu thành công.");
            return ResponseEntity.ok("Đổi mật khẩu thành công.");
         } catch (IllegalArgumentException e) {
             // Bắt lỗi nghiệp vụ (mật khẩu sai, xác nhận không khớp,...)
             logger.warn("!!! Đổi mật khẩu thất bại: {}", e.getMessage());
             return ResponseEntity.badRequest().body(e.getMessage());
         } catch (Exception e) {
             logger.error("!!! Lỗi không xác định khi đổi mật khẩu: {}", e.getMessage(), e);
             throw e; // Để GlobalExceptionHandler xử lý (trả về 500)
         }
    }
}