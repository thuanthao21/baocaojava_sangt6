// src/main/java/com/doan2/nguyenthuanthao_doan/controller/CategoryController.java
package com.doan2.nguyenthuanthao_doan.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doan2.nguyenthuanthao_doan.dto.CategoryDto;
import com.doan2.nguyenthuanthao_doan.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories") // Base path là /api/categories
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    
    /**
     * API Công khai: Lấy danh mục (dạng cây) cho HomePage
     */
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        // [GEMINI_VN]: SỬA LỖI: Gọi đúng hàm getAllCategoriesTree()
        return ResponseEntity.ok(categoryService.getAllCategoriesTree());
    }
    
    // [GEMINI_VN]: Đã XÓA tất cả các API /admin/categories... khỏi file này.
}