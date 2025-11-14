// src/main/java/com/doan2/nguyenthuanthao_doan/dto/AddressDto.java
package com.doan2.nguyenthuanthao_doan.dto;

import jakarta.validation.constraints.NotBlank; // Import validation
import lombok.Data;

@Data
public class AddressDto {
    private Long id; // ID chỉ có khi trả về, không cần khi tạo mới

    @NotBlank(message = "Street cannot be blank") // Ràng buộc: đường không được trống
    private String street;

    @NotBlank(message = "City cannot be blank") // Ràng buộc: thành phố không được trống
    private String city;

    @NotBlank(message = "Phone number cannot be blank") // Ràng buộc: số điện thoại không được trống
    private String phoneNumber;

    private boolean isDefault = false; // Mặc định không phải là địa chỉ mặc định khi tạo mới
}