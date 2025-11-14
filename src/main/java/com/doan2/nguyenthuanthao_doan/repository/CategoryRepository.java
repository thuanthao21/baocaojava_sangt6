package com.doan2.nguyenthuanthao_doan.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- THÊM IMPORT

import com.doan2.nguyenthuanthao_doan.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNull(Sort sort);

    // [MỚI] Dùng JOIN FETCH để tải 'parent' ngay lập tức
    // Giải quyết N+1 query problem khi gọi convertToDto
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parent")
    List<Category> findAllWithParent();
    
    // [MỚI] Tương tự, nhưng có sắp xếp (cho admin)
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parent")
    List<Category> findAllWithParent(Sort sort);
}