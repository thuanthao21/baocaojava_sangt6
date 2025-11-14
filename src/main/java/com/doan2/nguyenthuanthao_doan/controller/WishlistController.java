// src/main/java/com/doan2/nguyenthuanthao_doan/controller/WishlistController.java
package com.doan2.nguyenthuanthao_doan.controller;

import java.util.List; // Dùng lại ProductDto

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable; // Import thêm DeleteMapping
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doan2.nguyenthuanthao_doan.dto.ProductDto;
import com.doan2.nguyenthuanthao_doan.service.WishlistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlist") // Base path cho Wishlist
@RequiredArgsConstructor
public class WishlistController {

    private static final Logger logger = LoggerFactory.getLogger(WishlistController.class);
    private final WishlistService wishlistService;

    // --- API Lấy danh sách yêu thích ---
    @GetMapping
    public ResponseEntity<List<ProductDto>> getMyWishlist() {
        logger.info(">>> Received request to get current user's wishlist.");
        List<ProductDto> wishlist = wishlistService.getWishlist();
        logger.info("<<< Returning {} items in wishlist.", wishlist.size());
        return ResponseEntity.ok(wishlist);
    }

    // --- API Thêm sản phẩm vào danh sách yêu thích ---
    @PostMapping("/{productId}")
    public ResponseEntity<Void> addProductToWishlist(@PathVariable Long productId) {
        logger.info(">>> Received request to add product ID {} to wishlist.", productId);
        wishlistService.addProductToWishlist(productId);
        logger.info("<<< Product ID {} added successfully.", productId);
        // Trả về 200 OK (hoặc 204 No Content nếu muốn)
        return ResponseEntity.ok().build();
    }

    // --- API Xóa sản phẩm khỏi danh sách yêu thích ---
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeProductFromWishlist(@PathVariable Long productId) {
        logger.info(">>> Received request to remove product ID {} from wishlist.", productId);
        wishlistService.removeProductFromWishlist(productId);
        logger.info("<<< Product ID {} removed successfully (if existed).", productId);
        // Trả về 204 No Content (thành công, không có nội dung trả về)
        return ResponseEntity.noContent().build();
    }
}