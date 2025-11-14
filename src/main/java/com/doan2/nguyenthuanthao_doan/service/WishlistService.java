// src/main/java/com/doan2/nguyenthuanthao_doan/service/WishlistService.java
package com.doan2.nguyenthuanthao_doan.service;

import java.util.List; // Dùng lại ProductDto
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doan2.nguyenthuanthao_doan.dto.ProductDto;
import com.doan2.nguyenthuanthao_doan.entity.Product;
import com.doan2.nguyenthuanthao_doan.entity.User;
import com.doan2.nguyenthuanthao_doan.exception.ResourceNotFoundException; // Import Transactional
import com.doan2.nguyenthuanthao_doan.repository.ProductRepository;
import com.doan2.nguyenthuanthao_doan.repository.UserRepository; // Import Set

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private static final Logger logger = LoggerFactory.getLogger(WishlistService.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService; // Inject ProductService để dùng lại hàm convertToDto

    // --- Lấy User hiện tại (Hàm helper) ---
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("User must be authenticated to manage wishlist.");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    // --- Lấy danh sách yêu thích của người dùng hiện tại ---
    @Transactional(readOnly = true) // Giao dịch chỉ đọc, tối ưu hơn
    public List<ProductDto> getWishlist() {
        User currentUser = getCurrentUser();
        logger.info("Fetching wishlist for user ID: {}", currentUser.getId());
        // Lấy Set<Product> từ User entity (nhờ @ManyToMany)
        Set<Product> wishlistProducts = currentUser.getWishlist();
        logger.info("Found {} items in wishlist for user {}", wishlistProducts.size(), currentUser.getUsername());
        // Chuyển đổi Set<Product> thành List<ProductDto>
        return wishlistProducts.stream()
                .map(productService::convertToDto) // Dùng lại hàm convertToDto của ProductService
                .collect(Collectors.toList());
    }

    // --- Thêm sản phẩm vào danh sách yêu thích ---
    @Transactional
    public void addProductToWishlist(Long productId) {
        User currentUser = getCurrentUser();
        logger.info("User ID {} attempting to add product ID {} to wishlist.", currentUser.getId(), productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    logger.error("Product with ID {} not found.", productId);
                    return new ResourceNotFoundException("Product not found with id: " + productId);
                });

        // Lấy danh sách hiện tại và thêm sản phẩm vào
        currentUser.getWishlist().add(product);

        // Lưu lại User (quan hệ @ManyToMany sẽ tự cập nhật bảng nối)
        userRepository.save(currentUser);
        logger.info("Product ID {} added to wishlist for user ID {}.", productId, currentUser.getId());
    }

    // --- Xóa sản phẩm khỏi danh sách yêu thích ---
    @Transactional
    public void removeProductFromWishlist(Long productId) {
        User currentUser = getCurrentUser();
        logger.info("User ID {} attempting to remove product ID {} from wishlist.", currentUser.getId(), productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    logger.error("Product with ID {} not found.", productId);
                    return new ResourceNotFoundException("Product not found with id: " + productId);
                });

        // Lấy danh sách hiện tại và xóa sản phẩm
        boolean removed = currentUser.getWishlist().remove(product);

        if (removed) {
            // Lưu lại User để cập nhật bảng nối
            userRepository.save(currentUser);
            logger.info("Product ID {} removed from wishlist for user ID {}.", productId, currentUser.getId());
        } else {
            logger.warn("Product ID {} was not found in the wishlist for user ID {}.", productId, currentUser.getId());
            // Có thể ném lỗi hoặc không tùy yêu cầu
        }
    }
}