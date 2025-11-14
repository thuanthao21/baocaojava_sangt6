
// src/main/java/com/doan2/nguyenthuanthao_doan/dto/CategoryDto.java
package com.doan2.nguyenthuanthao_doan.dto;

import java.util.ArrayList;
import java.util.List; // Import List

import jakarta.validation.constraints.NotBlank;
import lombok.Data; // Import ArrayList

@Data
public class CategoryDto {
    private Long id;

    @NotBlank(message = "Category name cannot be blank") 
    private String name;
    
    // [GEMINI_VN]: Thêm parentId để logic frontend dễ xử lý
    private Long parentId; 
    
    // [GEMINI_VN]: Danh sách các DTO con
    private List<CategoryDto> children = new ArrayList<>(); // Khởi tạo rỗng
}