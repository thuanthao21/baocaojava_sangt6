// src/main/java/com/doan2/nguyenthuanthao_doan/dto/UserDto.java
package com.doan2.nguyenthuanthao_doan.dto;

import lombok.Data;

@Data
public class UserDto {
    private String username;
    private String email;
    private String fullName;
    private String role;
    // Không chứa mật khẩu
}