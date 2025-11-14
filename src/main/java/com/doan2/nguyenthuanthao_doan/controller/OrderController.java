// src/main/java/com/doan2/nguyenthuanthao_doan/controller/OrderController.java
package com.doan2.nguyenthuanthao_doan.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody; // Sửa: import *
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doan2.nguyenthuanthao_doan.dto.CreateOrderRequest;
import com.doan2.nguyenthuanthao_doan.dto.OrderDto;
import com.doan2.nguyenthuanthao_doan.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    private final OrderService orderService;

    // Endpoint để tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        logger.info(">>> Nhận được yêu cầu tạo đơn hàng: {}", request);
        try {
            OrderDto createdOrder = orderService.createOrder(request);
            logger.info("<<< Đã tạo đơn hàng thành công với ID: {}", createdOrder.getId());
            return ResponseEntity.ok(createdOrder);
        } catch (Exception e) {
            logger.error("!!! Lỗi xảy ra khi đang tạo đơn hàng: {}", e.getMessage(), e);
            throw e; // Để GlobalExceptionHandler xử lý
        }
    }

    // API Lấy Lịch sử Đơn hàng
    @GetMapping("/my-history")
    public ResponseEntity<List<OrderDto>> getMyOrderHistory() {
        logger.info(">>> Nhận được yêu cầu lấy lịch sử đơn hàng của người dùng hiện tại.");
        List<OrderDto> orderHistory = orderService.getOrderHistoryForCurrentUser();
        logger.info("<<< Trả về {} đơn hàng trong lịch sử.", orderHistory.size());
        return ResponseEntity.ok(orderHistory);
    }

    // --- [GEMINI_VN]: API MỚI - Hủy Đơn Hàng ---
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(@PathVariable Long orderId) {
        logger.info(">>> Nhận yêu cầu hủy đơn hàng ID: {}", orderId);
        try {
            // Gọi service để hủy đơn hàng
            OrderDto cancelledOrder = orderService.cancelOrder(orderId);
            logger.info("<<< Hủy đơn hàng ID: {} thành công.", orderId);
            return ResponseEntity.ok(cancelledOrder); // Trả về đơn hàng đã cập nhật
        } catch (IllegalStateException e) {
            // Bắt lỗi cụ thể (ví dụ: đơn hàng đã xử lý) và trả về 400
            logger.warn("!!! Không thể hủy đơn hàng ID: {}: {}", orderId, e.getMessage());
            // Bạn có thể tạo ErrorResponse DTO để trả về message lỗi
            // Tạm thời trả về 400 Bad Request
            return ResponseEntity.badRequest().body(null); 
        }
        // Các lỗi khác (401, 403, 404, 500) sẽ được Spring Security hoặc GlobalExceptionHandler xử lý
    }
}