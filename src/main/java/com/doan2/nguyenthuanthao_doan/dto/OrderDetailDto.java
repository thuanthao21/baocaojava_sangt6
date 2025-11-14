// src/main/java/com/doan2/nguyenthuanthao_doan/dto/OrderDetailDto.java
package com.doan2.nguyenthuanthao_doan.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class OrderDetailDto {
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal price;
}