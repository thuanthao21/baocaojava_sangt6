// src/main/java/com/doan2/nguyenthuanthao_doan/dto/CreateOrderRequest.java
package com.doan2.nguyenthuanthao_doan.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty; // Import NotNull
import jakarta.validation.constraints.NotNull; // Import Positive
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotEmpty(message = "Shipping address is required")
    private String shippingAddress;

    @NotEmpty(message = "Order must contain items")
    @Valid // Kích hoạt validation cho các đối tượng trong List
    private List<OrderItemDto> items;

    @Data
    public static class OrderItemDto {
        @NotNull(message = "Product ID cannot be null") // Đảm bảo ID sản phẩm không null
        private Long productId;

        @Positive(message = "Quantity must be positive") // Đảm bảo số lượng > 0
        private int quantity;
    }
}