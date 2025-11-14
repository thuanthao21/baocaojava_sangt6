// src/main/java/com/doan2/nguyenthuanthao_doan/controller/ReviewController.java
package com.doan2.nguyenthuanthao_doan.controller;

import com.doan2.nguyenthuanthao_doan.dto.ReviewDto;
import com.doan2.nguyenthuanthao_doan.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") // Đặt base path là /api
@RequiredArgsConstructor
public class ReviewController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);
    private final ReviewService reviewService;

    // --- API Lấy tất cả đánh giá của một sản phẩm ---
    // Ví dụ: GET /api/products/5/reviews
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<List<ReviewDto>> getReviewsForProduct(@PathVariable Long productId) {
        logger.info(">>> Received request to get reviews for product ID: {}", productId);
        List<ReviewDto> reviews = reviewService.getReviewsForProduct(productId);
        logger.info("<<< Returning {} reviews for product ID: {}", reviews.size(), productId);
        return ResponseEntity.ok(reviews);
    }

    // --- API Thêm một đánh giá mới ---
    // Ví dụ: POST /api/products/5/reviews
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ReviewDto> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewDto reviewDto) {
        logger.info(">>> Received request to add review for product ID {}: {}", productId, reviewDto);
        ReviewDto savedReview = reviewService.addReview(productId, reviewDto);
        logger.info("<<< Review added successfully with ID: {}", savedReview.getId());
        return ResponseEntity.ok(savedReview); // Trả về 200 OK thay vì 201 Created để đơn giản
    }
}