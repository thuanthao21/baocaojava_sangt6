// src/main/java/com/doan2/nguyenthuanthao_doan/repository/OrderRepository.java
package com.doan2.nguyenthuanthao_doan.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.doan2.nguyenthuanthao_doan.entity.Order; // Import List

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Thêm hàm để lấy lịch sử đơn hàng theo user ID
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

@Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.orderDetails od " +
           "LEFT JOIN FETCH od.product " +
           "ORDER BY o.orderDate DESC")
    List<Order> findAllWithDetailsForAdmin();

    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.orderDetails od " +
           "LEFT JOIN FETCH od.product " +
           "WHERE o.id = :orderId")
    Optional<Order> findByIdWithDetails(@Param("orderId") Long orderId);}