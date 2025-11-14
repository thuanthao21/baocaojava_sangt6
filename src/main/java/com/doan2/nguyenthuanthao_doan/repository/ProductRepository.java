// src/main/java/com/doan2/nguyenthuanthao_doan/repository/ProductRepository.java
package com.doan2.nguyenthuanthao_doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.doan2.nguyenthuanthao_doan.entity.Product; // <-- 1. Import JpaSpecificationExecutor

// 2. Kế thừa JpaSpecificationExecutor<Product>
// JpaRepository cung cấp các hàm CRUD cơ bản (save, findById, findAll).
// JpaSpecificationExecutor cung cấp một hàm mới: findAll(Specification, Pageable),
// cho phép chúng ta xây dựng các câu lệnh WHERE động.
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
        boolean existsByCategoryId(Long categoryId);
}