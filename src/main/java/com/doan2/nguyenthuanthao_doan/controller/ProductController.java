// src/main/java/com/doan2/nguyenthuanthao_doan/controller/ProductController.java
package com.doan2.nguyenthuanthao_doan.controller;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping; // Import *
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // Import
import org.springframework.web.bind.annotation.RestController;

import com.doan2.nguyenthuanthao_doan.dto.ProductDto;
import com.doan2.nguyenthuanthao_doan.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products") // Base path là /api/products
@RequiredArgsConstructor // Dùng constructor injection
public class ProductController {

    private final ProductService productService;

    /**
     * API Công khai: Lấy danh sách sản phẩm (có lọc, tìm kiếm, phân trang)
     */
    @GetMapping
    public ResponseEntity<Page<ProductDto>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size, // Sửa size mặc định thành 20
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder
    ) {
        Page<ProductDto> productPage = productService.getAllProducts(
                search, categoryId, minPrice, maxPrice, page, size, sortBy, sortOrder
        );
        return ResponseEntity.ok(productPage);
    }

    /**
     * API Công khai: Lấy chi tiết 1 sản phẩm
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
    
    
}