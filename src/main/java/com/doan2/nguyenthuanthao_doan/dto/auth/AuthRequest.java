package com.doan2.nguyenthuanthao_doan.dto.auth;



import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}