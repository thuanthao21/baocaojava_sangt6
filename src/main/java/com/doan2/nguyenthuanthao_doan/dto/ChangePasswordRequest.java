// src/main/java/com/doan2/nguyenthuanthao_doan/dto/ChangePasswordRequest.java
package com.doan2.nguyenthuanthao_doan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Current password cannot be blank")
    private String currentPassword;

    @NotBlank(message = "New password cannot be blank")
    @Size(min = 6, message = "New password must be at least 6 characters long")
    private String newPassword;

    @NotBlank(message = "Confirmation password cannot be blank")
    private String confirmationPassword;
}