package com.doan2.nguyenthuanthao_doan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateOrderAddressRequest {
    
    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;
}