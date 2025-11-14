// src/main/java/com/doan2/nguyenthuanthao_doan/dto/ReviewDto.java
package com.doan2.nguyenthuanthao_doan.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewDto {
    private Long id;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int rating; // Số sao đánh giá

    @NotBlank(message = "Comment cannot be blank")
    private String comment; // Nội dung bình luận

    private LocalDateTime createdAt; // Thời gian tạo
    private String username; // Tên người dùng đánh giá
    private Long productId; // ID sản phẩm được đánh giá
    private Long userId; // ID người dùng đánh giá
}