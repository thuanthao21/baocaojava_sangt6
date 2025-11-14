package com.doan2.nguyenthuanthao_doan.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort; // Import Sort
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import com.doan2.nguyenthuanthao_doan.dto.CategoryDto;
import com.doan2.nguyenthuanthao_doan.entity.Category;
import com.doan2.nguyenthuanthao_doan.exception.ResourceNotFoundException;
import com.doan2.nguyenthuanthao_doan.repository.CategoryRepository;
import com.doan2.nguyenthuanthao_doan.repository.ProductRepository;

import lombok.RequiredArgsConstructor; // Import

@Service
@RequiredArgsConstructor // Dùng constructor injection
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    
    // Hàm convertToDto (Dùng cho hàm Tree)
    private CategoryDto convertToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
        }
        return dto;
    }
    
    /** [User] Lấy danh mục (dạng cây) cho HomePage */
@Transactional(readOnly = true)
public List<CategoryDto> getAllCategoriesTree() {
    // [SỬA LỖI Ở ĐÂY]
    // Phải dùng hàm "findAllWithParent" để tránh lỗi N+1
    List<Category> allCategories = categoryRepository.findAllWithParent(); 
    
    // Phần code còn lại của bạn để xây dựng cây (dùng Map) là đúng
    Map<Long, CategoryDto> categoryMap = allCategories.stream()
            .map(this::convertToDto) // Đã an toàn để gọi getParent()
            .collect(Collectors.toMap(CategoryDto::getId, dto -> dto));

    List<CategoryDto> rootCategories = new ArrayList<>();
        for (CategoryDto dto : categoryMap.values()) {
            Long parentId = dto.getParentId();
            if (parentId == null) {
                rootCategories.add(dto);
            } else {
                CategoryDto parentDto = categoryMap.get(parentId);
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                }
            }
        }
        return rootCategories;
    }

    /** [Admin] Lấy tất cả Category (dạng phẳng, sắp xếp theo tên) */
@Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        // [SỬA] Dùng hàm mới để tránh N+1
        List<Category> allCategories = categoryRepository.findAllWithParent(Sort.by(Sort.Direction.ASC, "name"));

        // 2. Chuyển đổi tất cả sang DTO dạng phẳng
        return allCategories.stream()
                .map(this::convertToDto) // Dùng hàm convertToDto phẳng (đã có)
                .collect(Collectors.toList());
    }    /** [Admin] Tạo danh mục (Logic cũ của bạn) */
    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = new Category();
        category.setName(categoryDto.getName());
    
        if (categoryDto.getParentId() != null) {
            Category parent = categoryRepository.findById(categoryDto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category not found with id: " + categoryDto.getParentId()));
            category.setParent(parent);
        }
    
        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }
    
    /** [Admin] Cập nhật danh mục (Logic cũ của bạn) */
    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        category.setName(categoryDto.getName());
    
        if (categoryDto.getParentId() != null) {
             if (id.equals(categoryDto.getParentId())) {
                 throw new IllegalArgumentException("A category cannot be its own parent.");
             }
            Category parent = categoryRepository.findById(categoryDto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category not found with id: " + categoryDto.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToDto(updatedCategory);
    }
    
    /** [Admin] Xóa danh mục (Logic cũ của bạn) */
@Transactional
     public void deleteCategory(Long id) {
         Category category = categoryRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

         // Kiểm tra 1: Không cho xóa nếu có danh mục con
         if (category.getChildren() != null && !category.getChildren().isEmpty()) {
             throw new IllegalStateException("Cannot delete category with children. Please delete (or move) children first.");
         }

        // [SỬA Ở ĐÂY] Kiểm tra 2: Không cho xóa nếu có sản phẩm
        if (productRepository.existsByCategoryId(id)) {
            throw new IllegalStateException("Cannot delete category with associated products.");
        }

         // Nếu qua được 2 kiểm tra, tiến hành xóa
         categoryRepository.delete(category);
    }}