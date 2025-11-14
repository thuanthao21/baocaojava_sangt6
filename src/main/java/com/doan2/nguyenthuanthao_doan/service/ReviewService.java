// src/main/java/com/doan2/nguyenthuanthao_doan/service/ReviewService.java
package com.doan2.nguyenthuanthao_doan.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doan2.nguyenthuanthao_doan.dto.ReviewDto;
import com.doan2.nguyenthuanthao_doan.entity.Product;
import com.doan2.nguyenthuanthao_doan.entity.Review;
import com.doan2.nguyenthuanthao_doan.entity.User;
import com.doan2.nguyenthuanthao_doan.exception.ResourceNotFoundException;
import com.doan2.nguyenthuanthao_doan.repository.ProductRepository;
import com.doan2.nguyenthuanthao_doan.repository.ReviewRepository;
import com.doan2.nguyenthuanthao_doan.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    // Có thể cần OrderRepository để kiểm tra xem user đã mua hàng chưa (tùy yêu cầu)
    // private final OrderRepository orderRepository;

    // --- Hàm Helper: Chuyển Review Entity sang ReviewDto ---
    private ReviewDto convertToDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        // Lấy thông tin cơ bản, tránh vòng lặp
        if (review.getUser() != null) {
            dto.setUserId(review.getUser().getId());
            dto.setUsername(review.getUser().getUsername());
        }
        if (review.getProduct() != null) {
            dto.setProductId(review.getProduct().getId());
        }
        return dto;
    }

    // --- Lấy tất cả đánh giá cho một sản phẩm ---
    public List<ReviewDto> getReviewsForProduct(Long productId) {
        logger.info("Fetching reviews for product ID: {}", productId);
        // Kiểm tra sản phẩm tồn tại
        if (!productRepository.existsById(productId)) {
            logger.warn("Attempted to fetch reviews for non-existent product ID: {}", productId);
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        logger.info("Found {} reviews for product ID: {}", reviews.size(), productId);
        return reviews.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- Thêm một đánh giá mới ---
    @Transactional
    public ReviewDto addReview(Long productId, ReviewDto reviewDto) {
        logger.info("Attempting to add review for product ID: {}", productId);

        // 1. Lấy thông tin người dùng đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            logger.error("User is not authenticated. Cannot add review.");
            throw new IllegalStateException("User must be authenticated to add a review.");
        }
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        logger.info("Review submitted by user ID: {}", currentUser.getId());

        // 2. Tìm sản phẩm cần đánh giá
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                     logger.error("Product with ID {} not found for review.", productId);
                     return new ResourceNotFoundException("Product not found with id: " + productId);
                });

        // 3. (Tùy chọn - Logic phức tạp): Kiểm tra xem người dùng đã mua sản phẩm này chưa
        // boolean hasPurchased = orderRepository.existsByUserIdAndOrderDetailsProductId(currentUser.getId(), productId);
        // if (!hasPurchased) {
        //     logger.warn("User {} attempted to review product {} without purchasing.", username, productId);
        //     throw new IllegalStateException("You can only review products you have purchased.");
        // }
        // logger.info("User {} purchase confirmed for product {}", username, productId);

        // 4. Tạo đối tượng Review
        Review review = new Review();
        review.setProduct(product);
        review.setUser(currentUser);
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        // createdAt sẽ tự động được gán bởi @PrePersist

        // 5. Lưu vào CSDL
        logger.info("Saving review...");
        Review savedReview = reviewRepository.save(review);
        logger.info("Review saved successfully with ID: {}", savedReview.getId());

        // 6. Chuyển đổi sang DTO và trả về
        return convertToDto(savedReview);
    }
}