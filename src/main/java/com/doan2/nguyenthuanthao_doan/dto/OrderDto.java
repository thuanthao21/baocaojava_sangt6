// src/main/java/com/doan2/nguyenthuanthao_doan/dto/OrderDto.java
package com.doan2.nguyenthuanthao_doan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import lombok.Data;

@Data
public class OrderDto {
    private Long id;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private Set<OrderDetailDto> orderDetails; 
    
    private Long userId; 
    private String username;

}