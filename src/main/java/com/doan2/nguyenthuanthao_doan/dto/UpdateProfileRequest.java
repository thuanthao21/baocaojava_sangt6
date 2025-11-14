// src/main/java/com/doan2/nguyenthuanthao_doan/dto/UpdateProfileRequest.java
package com.doan2.nguyenthuanthao_doan.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Full name cannot be blank")
    private String fullName;
}