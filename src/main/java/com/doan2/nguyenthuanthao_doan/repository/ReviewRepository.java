// src/main/java/com/doan2/nguyenthuanthao_doan/repository/ReviewRepository.java
package com.doan2.nguyenthuanthao_doan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doan2.nguyenthuanthao_doan.entity.Review; // Import List

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Tự động tạo câu query: SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    // (Tùy chọn - Dùng để kiểm tra mua hàng)
    // boolean existsByUserIdAndProductId(Long userId, Long productId);
}